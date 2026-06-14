import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { appSetError, appSetTheme, selectAppResolvedTheme, selectAppTheme } from './store/appSlice';
import { THEME_STORAGE_KEY } from './constants/app_constants';
import { api } from './api/api';
import { Content } from './Content';

function AppContent() {
  const dispatch = useDispatch();
  const theme = useSelector(selectAppTheme);
  const resolvedTheme = useSelector(selectAppResolvedTheme);

  useEffect(() => {
    api.init().then((r) => {
      if (!r.ok) dispatch(appSetError(r.error!));
    });
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      dispatch(appSetTheme(saved));
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [resolvedTheme, theme]);

  return <Content />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
