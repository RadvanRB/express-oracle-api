# Integrace logování do aplikace

Tento dokument vysvětluje, jak integrovat implementované logování do Express aplikace.

## Přehled řešení

Implementované logování zahrnuje:

1. **Winston logger** - pro konzoli a soubory
2. **HTTP middleware** - pro logování všech požadavků
3. **Autentifikační middleware** - pro logování přihlášení a odhlášení
4. **Konfigurace v .env** - pro nastavení umístění logů a dalších parametrů

## Konfigurace v .env souboru

```
# Logování
DEBUG_FILTERS=true
LOG_LEVEL=debug
LOG_FOLDER=C:/logs/express-oracle-api
LOG_ACCESS=true
LOG_FORMAT=combined
```

- `LOG_FOLDER` - absolutní cesta ke složce, kam se budou ukládat logy
- `LOG_LEVEL` - úroveň logování (error, warn, info, debug)
- `LOG_ACCESS` - zda se mají logovat všechny HTTP požadavky (true/false)
- `LOG_FORMAT` - formát přístupových logů (combined, common, dev)

## Integrace do aplikace

Upravte soubor `src/app.ts` pro integraci logování:

```typescript
import express from 'express';
import { setupLogging } from './middlewares/requestLogger';
import { jwtAuthMiddleware } from './middlewares/authentication';
import { apiKeyAuthMiddleware } from './middlewares/apiKeyAuth';
import logger from './utils/logger';

// Inicializace Express aplikace
const app = express();

// Základní middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplikace middleware pro logování
setupLogging(app);

// Poznámka: Musí být po logovacím middleware, ale před routami
app.use(apiKeyAuthMiddleware);
app.use(jwtAuthMiddleware);

// Import a nastavení rout aplikace
// ...

// Ošetření chyb a 404
app.use((req, res, next) => {
  logger.warn(`Požadavek na neexistující cestu: ${req.originalUrl}`);
  res.status(404).json({ message: 'Požadovaný zdroj nebyl nalezen' });
});

app.use((err, req, res, next) => {
  logger.error('Neošetřená chyba aplikace', { 
    error: err.message, 
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });
  res.status(500).json({ message: 'Interní chyba serveru' });
});

export default app;
```

## Správa logů

### Struktura adresáře s logy

Po spuštění aplikace se vytvoří následující struktura souborů ve složce `LOG_FOLDER`:

- `combined.log` - všechny logy (všechny úrovně)
- `error.log` - pouze chybové logy (úroveň error)
- `warn.log` - pouze varovné logy (úroveň warn a výše)
- `access.log` - logy HTTP požadavků

### Archivace a rotace logů

Pro produkční nasazení doporučujeme použít nástroj pro rotaci logů, který zajistí:

1. Archivaci starých logů
2. Omezení velikosti log souborů
3. Automatické mazání starých logů

Příklad konfigurace pro `winston-daily-rotate-file`:

```typescript
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const rotatingFileTransport = new DailyRotateFile({
  filename: path.join(LOG_FOLDER, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d', // uchovávat logy 14 dní
  zippedArchive: true
});

// Přidání transportu do loggeru
logger.add(rotatingFileTransport);
```

## Příklady použití v kódu

### Logování běžných událostí

```typescript
import logger from './utils/logger';

// Různé úrovně logování
logger.error('Kritická chyba', { error: err });
logger.warn('Varování', { userId: 123 });
logger.info('Informace', { action: 'user_update' });
logger.debug('Ladící informace', { query: { name: 'Test' } });
```

### Logování autentifikačních událostí

```typescript
import { httpLogger } from './utils/logger';

// Ručně logovat autentifikační události
httpLogger.logAuth('login_failed', username, false, { reason: 'invalid_password' });
httpLogger.logAuth('password_reset', username, true, { method: 'email' });
```

## Monitorování a analýza logů

Pro pokročilé monitorování a analýzu logů doporučujeme:

1. Elasticsearch, Logstash a Kibana (ELK stack)
2. Graylog
3. LogDNA

Všechny tyto nástroje umožňují:
- Centralizované ukládání logů
- Pokročilé vyhledávání a filtrování
- Vytváření dashboardů a alertů
- Korelaci událostí z různých zdrojů