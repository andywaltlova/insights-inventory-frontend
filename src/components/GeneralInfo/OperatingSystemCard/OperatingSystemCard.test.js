/* eslint-disable camelcase */
import React from 'react';
import toJson from 'enzyme-to-json';
import OperatingSystemCard from './OperatingSystemCard';
import configureStore from 'redux-mock-store';
import { osTest, rhsmFacts } from '../../../__mocks__/selectors';
import { mountWithRouter } from '../../../Utilities/TestingUtilities';
import { Clickable } from '../LoadingCard/LoadingCard';

const location = {};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => location,
  useParams: jest.fn(() => ({ modalId: 'kernel_modules' })),
}));

describe('OperatingSystemCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    location.pathname = 'localhost:3000/example/path';
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...osTest,
        },
      },
      entityDetails: {
        entity: {
          facts: {
            rhsm: rhsmFacts,
          },
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    const wrapper = mountWithRouter(<OperatingSystemCard store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const wrapper = mountWithRouter(<OperatingSystemCard store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render enabled/disabled', () => {
    const store = mockStore({
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...osTest,
        },
      },
      entityDetails: {
        entity: {},
      },
    });
    const wrapper = mountWithRouter(<OperatingSystemCard store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly with rhsm facts', () => {
    const store = mockStore({
      ...initialState,
      systemProfileStore: {
        systemProfile: {
          loaded: true,
        },
      },
    });
    const wrapper = mountWithRouter(<OperatingSystemCard store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  describe('api', () => {
    it('should not render modules clickable', () => {
      const store = mockStore(initialState);
      const wrapper = mountWithRouter(<OperatingSystemCard store={store} />);
      expect(wrapper.find(Clickable).find('a')).toHaveLength(0);
    });

    it('should call handleClick on packages', () => {
      initialState = {
        systemProfileStore: {
          systemProfile: {
            loaded: true,
            ...osTest,
            kernel_modules: ['some-module'],
          },
        },
        entityDetails: {
          entity: {
            facts: {
              rhsm: rhsmFacts,
            },
          },
        },
      };

      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/kernel_modules';
      const wrapper = mountWithRouter(
        <OperatingSystemCard handleClick={onClick} store={store} />
      );
      wrapper.find(Clickable).find('a').first().simulate('click');
      expect(onClick).toHaveBeenCalled();
    });
  });

  [
    'hasRelease',
    'hasKernelRelease',
    'hasArchitecture',
    'hasLastBoot',
    'hasKernelModules',
  ].map((item) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      const wrapper = mountWithRouter(
        <OperatingSystemCard store={store} {...{ [item]: false }} />
      );
      expect(toJson(wrapper)).toMatchSnapshot();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    const wrapper = mountWithRouter(
      <OperatingSystemCard
        store={store}
        extra={[
          { title: 'something', value: 'test' },
          {
            title: 'with click',
            value: '1 tests',
            onClick: (_e, handleClick) => handleClick('Something', {}, 'small'),
          },
        ]}
      />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
