import { isWeb } from '../config';
import { WebApi } from './WebApi';
import { PythonApi } from './PythonApi';

export const api = isWeb ? new WebApi() : new PythonApi();
