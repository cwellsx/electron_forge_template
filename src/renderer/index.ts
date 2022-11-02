import './index.sass';

import { createRoot } from 'react-dom/client';

import { createApp } from './App';

const container = document.getElementById("renderer");

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(createApp());
