import _ from 'lodash';
import React, { ReactElement } from 'react';
import CheckboxFilter from './CheckboxFilter';
import DropdownFilter from './DropdownFilter';
import { FilterOptions, FilterSelection, FILTERS_IN_ORDER } from './filters';
import RangeFilter from './RangeFilter';

export interface FilterPanelProps {
  options: FilterOptions;
  selected: FilterSelection;
  setActive: (f: FilterSelection) => void;
}

function FilterPanel({
  options,
  selected,
  setActive,
}: FilterPanelProps): ReactElement {
  return (
    <div className="FilterPanel">
      {FILTERS_IN_ORDER.map(({ key, display, category }) => {
        const aFilter = selected[key];
        const setActiveFilter = (a): void => setActive({ [key]: a });

        return (
          <>
            {category === 'Dropdown' && (
              <DropdownFilter
                title={display}
                options={options[key]}
                selected={aFilter}
                setActive={setActiveFilter}
              />
            )}
            {category === 'Checkboxes' && (
              <CheckboxFilter
                title={display}
                options={options[key]}
                selected={aFilter}
                setActive={setActiveFilter}
              />
            )}
            {category === 'Range' && (
              <RangeFilter
                title={display}
                selected={aFilter}
                setActive={setActiveFilter}
              />
            )}
          </>
        );
      })}
    </div>
  );
}

export default React.memo(FilterPanel, _.isEqual);
