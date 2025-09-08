import { cfg } from '../../config/env';
import { NodeFetchClient } from '../http/nodeFetchClient';
import { PlaywrightClient } from '../http/pwClient';
import { SearchService } from '../api/search.service';
import { fromStorageState, fromTxtToken, fromEnv } from '../auth/authProviders';

export function makeSearchService(mode: 'storage' | 'txt' | 'env' = 'storage') {
  const auth =
    mode === 'storage' ? fromStorageState(cfg.storageStatePath)
    : mode === 'txt'    ? fromTxtToken()
    :                    fromEnv();

  const client =
    cfg.transport === 'pw'
      ? new PlaywrightClient(cfg.baseURL, cfg.storageStatePath)
      : new NodeFetchClient(cfg.baseURL);

  return new SearchService(client, cfg, auth);
}
