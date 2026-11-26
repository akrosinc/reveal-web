import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getTagCounts, setTagCount } from '../api';
import { AREA_TAGS } from '../constants';
import { TagCount } from '../providers/types';
import { mergeTagCounts, toTagValues } from '../utils/tagCounts';

export const useTagCounts = (locationId: string, isEnabled: boolean, instanceId?: string) => {
  const [loaded, setLoaded] = useState<{ locationId: string; tags: TagCount[] }>();

  useEffect(() => {
    let isCurrent = true;
    setLoaded(undefined);
    if (!isEnabled) return;
    getTagCounts(locationId, AREA_TAGS, instanceId)
      .then(res => isCurrent && setLoaded({ locationId, tags: res.tags ?? [] }))
      .catch(err => isCurrent && toast.error(err));
    return () => {
      isCurrent = false;
    };
  }, [locationId, isEnabled, instanceId]);

  const values = useMemo(
    () => (isEnabled && loaded?.locationId === locationId ? toTagValues(loaded.tags, 'count') : undefined),
    [loaded, locationId, isEnabled]
  );

  const save = useCallback(
    async (tags: TagCount[]): Promise<void> => {
      await Promise.all(
        tags.map(tag =>
          setTagCount(locationId, tag, instanceId).then(() =>
            setLoaded(current =>
              current?.locationId === locationId ? { ...current, tags: mergeTagCounts(current.tags, [tag]) } : current
            )
          )
        )
      ).catch(err => {
        toast.error(err);
        throw err;
      });
    },
    [locationId, instanceId]
  );

  return { values, save };
};
