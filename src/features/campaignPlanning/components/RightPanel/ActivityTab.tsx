import { evaluate } from 'mathjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronDown } from 'react-icons/bs';
import { toast } from 'react-toastify';
import {
  getCostsByInstanceAndLocation,
  getRecaptureLimitsByInstanceAndLocation,
  saveActionLocationRecaptureLimit,
  saveCostByLocation
} from '../../api';
import { TRANSPORT_MODES } from '../../placeholderData';
import { Action, CostContainer, CostVariable } from '../../providers/types';
import styles from './RightPanel.module.css';

interface Props {
  activities: Action[];
  instanceId?: string;
  locationId: string;
}

// The cost variables defined on an action's template, in declaration order, keyed by formula token
const costVariables = (activity: Action): [string, CostVariable][] =>
  Object.entries(activity.actionTemplate?.actionTemplateConfig?.costContainer?.variables ?? {});

const initialValue = (variable: CostVariable): string => {
  const value = variable.value ?? variable.defaultValue;
  return value != null ? String(value) : '';
};

// Evaluate the template's cost formula (e.g. "a * b * c") with mathjs, passing the current token
// values as the scope. Returns undefined when the formula is missing or can't be resolved.
const computeTotal = (formula: string | undefined, tokenValues: Record<string, number>): number | undefined => {
  if (!formula) return undefined;
  try {
    const result = evaluate(formula, tokenValues);
    return typeof result === 'number' && Number.isFinite(result) ? result : undefined;
  } catch {
    return undefined;
  }
};

const ActivityTab = ({ activities, instanceId, locationId }: Props) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Transport/cost sections collapsed by id; expanded by default
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // Selected transport mode per activity id; defaults to the first mode
  const [modeByActivity, setModeByActivity] = useState<Record<string, string>>({});
  // Edited cost values per activity id, keyed by the variable's token
  const [valuesByActivity, setValuesByActivity] = useState<Record<string, Record<string, string>>>({});
  // Manual total override per activity id; cleared when a variable field changes so the computed value returns
  const [totalOverride, setTotalOverride] = useState<Record<string, string>>({});
  // Captured numeric value per activity id, shown next to the activity title
  const [captureByActivity, setCaptureByActivity] = useState<Record<string, string>>({});
  const setCapture = (id: string, value: string) => setCaptureByActivity(current => ({ ...current, [id]: value }));
  const toggle = (id: string) => setCollapsed(current => ({ ...current, [id]: !current[id] }));

  // On entry (and when the instance/location changes), populate from the saved recapture limits and costs.
  // The two sources are read independently and seed their own slice of state.
  useEffect(() => {
    if (!instanceId || !locationId) return;
    let isCurrent = true;

    getRecaptureLimitsByInstanceAndLocation(instanceId, locationId)
      .then(limits => {
        if (!isCurrent) return;
        const counts: Record<string, string> = {};
        limits.forEach(limit => {
          if (limit.actionIdentifier != null && limit.count != null) {
            counts[limit.actionIdentifier] = String(limit.count);
          }
        });
        setCaptureByActivity(counts);
      })
      .catch(err => isCurrent && toast.error(String(err)));

    getCostsByInstanceAndLocation(instanceId, locationId)
      .then(costs => {
        if (!isCurrent) return;
        const values: Record<string, Record<string, string>> = {};
        const totals: Record<string, string> = {};
        costs.forEach(cost => {
          const actionId = cost.actionIdentifier;
          if (actionId == null) return;
          const variables = cost.costContainer?.variables ?? {};
          const tokenValues: Record<string, string> = {};
          Object.entries(variables).forEach(([token, variable]) => {
            if (variable.value != null) tokenValues[token] = String(variable.value);
          });
          if (Object.keys(tokenValues).length) values[actionId] = tokenValues;
          if (cost.calculatedValue != null) totals[actionId] = String(cost.calculatedValue);
        });
        setValuesByActivity(values);
        setTotalOverride(totals);
      })
      .catch(err => isCurrent && toast.error(String(err)));

    return () => {
      isCurrent = false;
    };
  }, [instanceId, locationId]);
  const selectMode = (id: string, mode: string) => setModeByActivity(current => ({ ...current, [id]: mode }));
  const setValue = (id: string, token: string, value: string) => {
    setValuesByActivity(current => ({ ...current, [id]: { ...current[id], [token]: value } }));
    // Editing an upstream field recomputes the total, discarding any manual override
    setTotalOverride(current => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  };
  const setTotal = (id: string, value: string) => setTotalOverride(current => ({ ...current, [id]: value }));

  if (!activities.length) {
    return <div className={styles.emptyActivities}>{t('campaignPlanning.noActivitiesAdded')}</div>;
  }

  // Resolve each activity's current cost fields, computed total and capture value in one place
  const resolved = activities.map(activity => {
    const variables = costVariables(activity);
    const edited = valuesByActivity[activity.identifier] ?? {};
    const formula = activity.actionTemplate?.actionTemplateConfig?.costContainer?.formula;
    // A field contributes to the total only when it holds a real number (empty stays empty, not 0)
    const rawValues = variables.map(([token, variable]): [string, string] => [
      token,
      edited[token] ?? initialValue(variable)
    ]);
    const allTokensFilled = rawValues.every(([, value]) => value.trim() !== '' && Number.isFinite(Number(value)));
    const tokenValues = Object.fromEntries(rawValues.map(([token, value]): [string, number] => [token, Number(value)]));
    // Only compute once every referenced field has a value, so partial input can't resolve to 0
    const computed = allTokensFilled ? computeTotal(formula, tokenValues) : undefined;
    const hasOverride = activity.identifier in totalOverride;
    const totalValue = hasOverride
      ? totalOverride[activity.identifier]
      : computed != null
      ? String(computed)
      : '';
    const capture = captureByActivity[activity.identifier] ?? '';
    const captureFilled = capture.trim() !== '' && Number.isFinite(Number(capture));
    const totalFilled = totalValue.trim() !== '' && Number.isFinite(Number(totalValue));
    // The template's cost container with the current field values captured into each variable
    const baseContainer = activity.actionTemplate?.actionTemplateConfig?.costContainer;
    const costContainer: CostContainer | undefined = baseContainer && {
      ...baseContainer,
      variables: Object.fromEntries(
        rawValues.map(([token, value]) => [
          token,
          { ...(baseContainer.variables?.[token] ?? { key: token }), value: Number(value) }
        ])
      )
    };
    return { activity, variables, edited, totalValue, capture, captureFilled, totalFilled, costContainer };
  });

  // Submit is allowed only when every activity has a captured value and a total cost
  const canSubmit = resolved.every(item => item.captureFilled && item.totalFilled);

  const submit = async () => {
    if (!canSubmit || !instanceId) return;
    setIsSubmitting(true);
    try {
      // The two tables are persisted independently per activity
      await Promise.all(
        resolved.flatMap(item => [
          saveActionLocationRecaptureLimit({
            instanceIdentifier: instanceId,
            locationIdentifier: locationId,
            actionIdentifier: item.activity.identifier,
            count: Number(item.capture)
          }),
          saveCostByLocation({
            instanceIdentifier: instanceId,
            locationIdentifier: locationId,
            actionIdentifier: item.activity.identifier,
            costContainer: item.costContainer,
            calculatedValue: Number(item.totalValue)
          })
        ])
      );
      toast.success(t('campaignPlanning.activitiesSaved'));
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.activityScroll}>
      <div className={styles.submitBar}>
        <button
          type="button"
          id="campaign-planning-activities-submit"
          className={styles.submit}
          disabled={!canSubmit || !instanceId || isSubmitting}
          onClick={submit}
        >
          {t('buttons.submit')}
        </button>
      </div>
      {resolved.map(({ activity, variables, edited, totalValue }) => {
        const isCollapsed = collapsed[activity.identifier];
        const selectedMode = modeByActivity[activity.identifier] ?? TRANSPORT_MODES[0];
        return (
          <div key={activity.identifier} className={styles.activityCard}>
            <div className={styles.activityHead}>
              <span className={styles.activityTitle}>{activity.title}</span>
              <input
                id={`campaign-planning-activity-value-${activity.identifier}`}
                className={styles.activityValue}
                type="number"
                inputMode="decimal"
                aria-label={t('campaignPlanning.activityValue', { name: activity.title })}
                value={captureByActivity[activity.identifier] ?? ''}
                onChange={e => setCapture(activity.identifier, e.target.value)}
              />
            </div>
            <button
              type="button"
              id={`campaign-planning-transport-toggle-${activity.identifier}`}
              className={styles.transportToggle}
              aria-expanded={!isCollapsed}
              onClick={() => toggle(activity.identifier)}
            >
              <span>{t('campaignPlanning.transportAndCost')}</span>
              <BsChevronDown className={isCollapsed ? styles.transportChevronCollapsed : styles.transportChevron} />
            </button>
            {!isCollapsed && (
              <>
                <div className={styles.segRow}>
                  {TRANSPORT_MODES.map(mode => (
                    <button
                      key={mode}
                      type="button"
                      className={mode === selectedMode ? `${styles.seg} ${styles.segActive}` : styles.seg}
                      aria-pressed={mode === selectedMode}
                      onClick={() => selectMode(activity.identifier, mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                {variables.map(([token, variable]) => {
                  const inputId = `campaign-planning-cost-${activity.identifier}-${token}`;
                  // A constant defined on the template isn't entered by the user
                  const isReadOnly = variable.source === 'CONSTANT';
                  const current = edited[token] ?? initialValue(variable);
                  return (
                    <div key={token} className={styles.editField}>
                      <label className={styles.fieldLabel} htmlFor={inputId}>
                        {variable.label ?? variable.name ?? token}
                      </label>
                      <span className={styles.editInputWrap}>
                        <input
                          id={inputId}
                          className={styles.editInput}
                          type="number"
                          inputMode="decimal"
                          value={current}
                          readOnly={isReadOnly}
                          onChange={e => setValue(activity.identifier, token, e.target.value)}
                        />
                        {variable.unit && <span className={styles.editUnit}>{variable.unit}</span>}
                      </span>
                    </div>
                  );
                })}
                <div className={styles.editField}>
                  <label className={styles.fieldLabel} htmlFor={`campaign-planning-cost-${activity.identifier}-total`}>
                    {t('campaignPlanning.totalCost')}
                  </label>
                  <span className={styles.editInputWrap}>
                    <input
                      id={`campaign-planning-cost-${activity.identifier}-total`}
                      className={styles.editInput}
                      type="number"
                      inputMode="decimal"
                      value={totalValue}
                      onChange={e => setTotal(activity.identifier, e.target.value)}
                    />
                  </span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTab;
