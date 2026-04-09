import { isNumeric } from 'mathjs';
import { useState, useMemo } from 'react';
import { Tabs, Tab, Button } from 'react-bootstrap';
import { UserDefinedLayer, UserDefinedNames } from '../../SimulationMapViewModels';
import { EntityTag } from '../../../../providers/types';
import { StatsLayer } from '../../../Simulation';

import styles from './StatisticsPanel.module.css';

interface StatisticsPanelProps {
  userDefinedLayers: UserDefinedLayer[];
  userDefinedNames: UserDefinedNames[];
  entityTags: EntityTag[];
  stats: StatsLayer;
  defaultColor?: string; // Add defaultColor as a prop
}

function StatisticsPanel({
  userDefinedLayers,
  userDefinedNames,
  entityTags,
  stats,
  defaultColor
}: StatisticsPanelProps) {
  const [showStats, setShowStats] = useState(true);

  const processedUserDefinedLayers = useMemo(() => {
    // Group layers by 'layerName'
    const groupLayersByKey = (layers: UserDefinedLayer[]) => {
      return layers.reduce((acc, layer) => {
        acc[layer.layerName] = acc[layer.layerName] || [];
        acc[layer.layerName].push(layer);
        return acc;
      }, {} as Record<string, UserDefinedLayer[]>);
    };

    // Convert grouped layers into desired format
    const groupedLayers = groupLayersByKey(userDefinedLayers);
    return Object.entries(groupedLayers).map(([key, layers]) => ({
      key,
      list: layers,
      color: layers[0]?.col || defaultColor // Use layer color or default
    }));
  }, [userDefinedLayers, defaultColor]);

  const handleToggleStats = () => {
    setShowStats(prev => !prev);
  };

  const renderLayerList = (layerList: UserDefinedLayer[] | undefined) =>
    layerList?.map(item => (
      <p key={item.key}>
        <b>{item.geo}:</b> {item.size}
      </p>
    ));

  const renderTagStats = (userDefinedLayerKey: string) => {
    const relevantNames = userDefinedNames.filter(layer => layer.key === userDefinedLayerKey);

    return relevantNames.flatMap(locItem =>
      Array.from(locItem.tagList || []).flatMap(meta => {
        const tagItem = entityTags.find(tag => tag.tag === meta);
        const shouldDisplay = tagItem?.simulationDisplay && stats[userDefinedLayerKey]?.[meta];

        if (!shouldDisplay) return null;

        const num = stats[userDefinedLayerKey][meta];
        const val = isNumeric(num) && typeof num === 'number' ? Math.round(num).toLocaleString('en-US') : num;

        return (
          <p key={meta}>
            <b>{meta}:</b> {val}
          </p>
        );
      })
    );
  };

  const renderTabs = () =>
    processedUserDefinedLayers.map(userDefinedLayer => (
      <Tab
        className={styles.statisticsPanelBody}
        unmountOnExit
        eventKey={userDefinedLayer.key}
        title={userDefinedLayer.key}
        key={userDefinedLayer.key}
      >
        <>
          {renderLayerList(userDefinedLayer.list)}
          {renderTagStats(userDefinedLayer.key)}
        </>
      </Tab>
    ));

  return (
    <section className={styles.statisticsPanel} onClick={() => !showStats && setShowStats(true)}>
      {userDefinedLayers.length > 0 && !showStats && 'Show Stats'}
      <Tabs unmountOnExit>{showStats && renderTabs()}</Tabs>
      {showStats && (
        <Button variant="secondary" size="sm" onClick={handleToggleStats}>
          {showStats ? 'Close' : 'Open'}
        </Button>
      )}
    </section>
  );
}

export default StatisticsPanel;
