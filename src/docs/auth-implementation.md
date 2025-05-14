# Implementace autentifikace a autorizace

Tento dokument popisuje implementaci autentifikace a autorizace v Express API aplikaci s integrací s Keycloakem, JWT tokeny a systémem oprávnění pro CRUD operace a spouštění procedur.

## Obsah
1. [Architektura](#architektura)
2. [JWT Tokeny](#jwt-tokeny)
3. [Integrace s Keycloakem](#integrace-s-keycloakem)
4. [Systém oprávnění a rolí](#systém-oprávnění-a-rolí)
5. [Autentifikace třetích stran](#autentifikace-třetích-stran)
6. [Monitoring událostí](#monitoring-událostí)
7. [Praktické ukázky](#praktické-ukázky)
8. [Konfigurace](#konfigurace)

## Architektura

Celý systém autentifikace a autorizace se skládá z následujících komponent:

### Frontend (NextJS)
- Autentifikace uživatelů pomocí Keycloaku s využitím OAuth2
- Získání JWT tokenu z Keycloaku
- Vygenerování vlastního JWT tokenu pro komunikaci s API
- Odesílání tohoto tokenu s každým požadavkem na API

### Backend (Express API)
- Ověření JWT tokenu pomocí middleware
- Extrakce uživatelského jména a rolí z tokenu
- Kontrola oprávnění uživatele pro požadované operace
- Logování přístupů a bezpečnostních událostí

### Middleware
- **authentication.ts** - Ověřuje JWT tokeny
- **authorization.ts** - Kontroluje oprávnění uživatele
- **apiKeyAuth.ts** - Zpracovává autentifikaci třetích stran pomocí API klíčů

### Datové modely
- **Permission** - Model pro definici oprávnění
- **Role** - Model pro seskupení oprávnění
- **UserRole** - Propojovací model pro přiřazení rolí uživatelům
- **ApiKey** - Model pro správu API klíčů třetích stran

## JWT Tokeny

### Struktura JWT tokenu

JWT token vytvořený v NextJS obsahuje následující části:

```typescript
interface JwtPayload {
  // Standardní JWT claims
  iss: string;              // Vydavatel tokenu (NextJS server)
  sub: string;              // Předmět tokenu (username uživatele)
  aud: string;              // Cílový příjemce (Express API)
  exp: number;              // Čas vypršení platnosti
  iat: number;              // Čas vydání
  
  // Vlastní claims
  username: string;         // Uživatelské jméno z Active Directory
  roles: string[];          // Role uživatele
  permissions?: string[];   // Volitelně přímá oprávnění
  userId?: string;          // ID uživatele v systému
  email?: string;           // Email uživatele
  displayName?: string;     // Zobrazované jméno
}
```

### Vytvoření JWT tokenu v NextJS

```typescript
// Příklad kódu pro vytvoření JWT tokenu v NextJS
import jwt from 'jsonwebtoken';

export async function createApiToken(keycloakToken: any) {
  // Dekódování Keycloak tokenu
  const decodedToken = jwt.decode(keycloakToken);
  
  // Vytvoření vlastního tokenu
  const payload = {
    iss: process.env.JWT_ISSUER,
    sub: decodedToken.preferred_username,
    aud: process.env.JWT_AUDIENCE,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8), // 8 hodin
    iat: Math.floor(Date.now() / 1000),
    
    username: decodedToken.preferred_username,
    roles: decodedToken.realm_access.roles,
    email: decodedToken.email,
    displayName: decodedToken.name
  };
  
  // Podepsání tokenu
  return jwt.sign(payload, process.env.JWT_SECRET);
}
```

### Ověření JWT tokenu v Express API

JWT token je ověřován v middleware authentication.ts, který kontroluje jeho platnost, podpis a extrahuji informace o uživateli, které jsou pak k dispozici v dalších částech aplikace.

## Integrace s Keycloakem

### Konfigurace Keycloaku

V Keycloaku je třeba nastavit:
1. Realm pro aplikaci
2. Client pro NextJS frontend
3. Client pro Express API (pokud je potřeba přímá komunikace)
4. Role a jejich mapování

### Nastavení v .env souboru

```
# Keycloak
KEYCLOAK_URL=http://localhost:8080/auth
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=express-api
```

### Proces autentifikace

1. Uživatel se přihlásí do NextJS aplikace přes Keycloak
2. Keycloak vrátí access_token, id_token a refresh_token
3. NextJS vygeneruje vlastní JWT token s informacemi z Keycloak tokenu
4. Tento token je posílán v hlavičce Authorization s každým požadavkem
5. Express API ověří token a získá údaje o uživateli
6. Uživatelské jméno je použito pro kontrolu oprávnění

## Systém oprávnění a rolí

### Model Permission

Model Permission definuje konkrétní oprávnění pro entitu (tabulku nebo proceduru) a typ operace.

```typescript
// Typy operací
enum OperationType {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE'
}

// Typy entit
enum EntityType {
  MODEL = 'MODEL',       // Tabulka
  PROCEDURE = 'PROCEDURE' // Procedura
}

// Příklad entity Permission
@Entity('permissions')
class Permission {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  entityName: string;  // Název tabulky nebo procedury
  
  @Column({
    type: 'enum',
    enum: OperationType
  })
  operation: OperationType;  // Typ operace
  
  @Column({
    type: 'enum',
    enum: EntityType
  })
  entityType: EntityType;  // Typ entity
  
  @Column({ nullable: true })
  condition: string;  // Volitelná podmínka pro oprávnění
  
  @ManyToMany(() => Role)
  roles: Role[];  // Role, které mají toto oprávnění
}
```

### Model Role

Model Role seskupuje oprávnění a může být přiřazen uživatelům.

```typescript
@Entity('roles')
class Role {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ unique: true })
  name: string;  // Název role
  
  @Column({ nullable: true })
  description: string;  // Popis role
  
  @ManyToMany(() => Permission)
  @JoinTable()
  permissions: Permission[];  // Oprávnění přiřazená této roli
  
  @ManyToMany(() => User)
  users: User[];  // Uživatelé s touto rolí
}
```

### Middleware pro autorizaci

Middleware authorization.ts poskytuje funkce pro kontrolu oprávnění:

```typescript
// Middleware pro kontrolu oprávnění
export const requirePermission = (
  entityName: string,
  operation: OperationType,
  entityType: EntityType,
  condition?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Získání uživatele z request (přidán v authentication middleware)
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ message: 'Uživatel není autentifikován' });
      }
      
      // Získání rolí uživatele
      const userRoles = user.roles || [];
      
      // Kontrola přeskočení ověření v dev prostředí
      if (process.env.NODE_ENV === 'development' && process.env.SKIP_PERMISSION_CHECK === 'true') {
        return next();
      }
      
      // Kontrola oprávnění
      const hasPermission = await permissionService.checkUserPermission(
        user.username,
        userRoles,
        entityName,
        operation,
        entityType,
        req
      );
      
      if (hasPermission) {
        return next();
      }
      
      // Logování pokusu o přístup
      logger.warn({
        message: 'Access denied',
        user: user.username,
        entity: entityName,
        operation,
        entityType,
        roles: userRoles
      });
      
      return res.status(403).json({ 
        message: 'Nemáte oprávnění k provedení této operace',
        entity: entityName,
        operation,
        requiredRoles: [] // Zde by mohly být vypsány role, které by přístup umožnily
      });
    } catch (error) {
      logger.error('Error checking permissions', { error });
      return res.status(500).json({ message: 'Chyba při kontrole oprávnění' });
    }
  };
};
```

## Autentifikace třetích stran

Pro autentifikaci třetích stran (B2B integrace, externí služby) je implementován systém API klíčů.

### Model ApiKey

```typescript
@Entity('api_keys')
class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  name: string;  // Název klíče
  
  @Column({ unique: true })
  key: string;  // Samotný API klíč (hash)
  
  @Column()
  clientId: string;  // ID klienta
  
  @Column({ nullable: true })
  description: string;  // Popis
  
  @Column({ type: 'datetime' })
  expiresAt: Date;  // Datum expirace
  
  @Column({ default: true })
  isActive: boolean;  // Je klíč aktivní?
  
  @Column('simple-array', { nullable: true })
  allowedIps: string[];  // Povolené IP adresy
  
  @Column('simple-array')
  roles: string[];  // Role přiřazené tomuto klíči
}
```

### Middleware pro API klíče

Middleware apiKeyAuth.ts zpracovává autentifikaci pomocí API klíčů:

```typescript
// Middleware pro autentifikaci API klíčem
export const apiKeyAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Přeskočení, pokud je již uživatel autentifikován
    if (req.user) {
      return next();
    }
    
    // Získání API klíče z hlavičky
    const apiKey = req.header(process.env.API_KEY_HEADER);
    
    // Pokud není API klíč, pokračovat (možná je to JWT autentifikace)
    if (!apiKey) {
      return next();
    }
    
    // Ověření API klíče
    const apiKeyService = getApiKeyService();
    const validApiKey = await apiKeyService.validateApiKey(apiKey, req.ip);
    
    if (!validApiKey) {
      logger.warn({
        message: 'Invalid API key',
        ip: req.ip,
        path: req.path
      });
      
      return res.status(401).json({ message: 'Neplatný API klíč' });
    }
    
    // Nastavení uživatele pro další middleware
    req.user = {
      username: `api-client:${validApiKey.clientId}`,
      roles: validApiKey.roles,
      isApiClient: true,
      apiKey: validApiKey
    };
    
    // Logování úspěšné autentifikace
    logger.info({
      message: 'API key authentication',
      client: validApiKey.clientId,
      ip: req.ip,
      path: req.path
    });
    
    return next();
  } catch (error) {
    logger.error('API key authentication error', { error });
    return next();
  }
};
```

## Monitoring událostí

Pro monitoring důležitých bezpečnostních událostí je implementován systém v logger.ts, který sleduje a zaznamenává klíčové události.

### Typy sledovaných událostí

- Neúspěšné pokusy o přihlášení
- Přístupy na nepovolené zdroje
- Opakované neúspěšné pokusy ze stejné IP adresy
- Podezřelé aktivity (například pokusy o přístup k citlivým endpointům)
- Server errors (5xx chyby)
- Kritické chyby

### Implementace monitoringu

```typescript
// Monitorování důležitých událostí
interface MonitoringEvent {
  timestamp: Date;
  level: string;
  message: string;
  data?: any;
  eventType: string;
}

// Posledních 100 důležitých událostí
const recentImportantEvents: MonitoringEvent[] = [];
const MAX_MONITORING_EVENTS = 100;

// Funkce pro zaznamenání události do monitoringu
const monitorEvent = (level: string, message: string, eventType: string, data?: any) => {
  const event: MonitoringEvent = {
    timestamp: new Date(),
    level,
    message,
    data,
    eventType
  };
  
  // Přidání události do pole
  recentImportantEvents.unshift(event);
  
  // Omezení velikosti pole
  if (recentImportantEvents.length > MAX_MONITORING_EVENTS) {
    recentImportantEvents.pop();
  }
  
  // Pro kritické události (error, security, auth) logujeme do konzole a mohli bychom odeslat notifikaci
  if (level === 'error' || (level === 'warn' && (eventType === 'auth' || eventType === 'security'))) {
    console.warn(`[MONITORING] Critical event: ${message} [${eventType}]`);
    // Zde by mohlo být odesílání do externího monitorovacího systému
  }
};

// Přepsání metod loggeru pro automatické monitorování
logger.error = (message: any, ...args: any[]) => {
  originalError(message, ...args);
  
  let eventMessage = message;
  let eventData = args[0] || {};
  
  if (typeof message === 'object') {
    eventMessage = message.message || JSON.stringify(message);
    eventData = message;
  }
  
  monitorEvent('error', eventMessage, 'error', eventData);
  
  return logger;
};

// Získání nedávných důležitých událostí pro analýzu
export const getRecentEvents = (count: number = 10, type?: string): MonitoringEvent[] => {
  if (type) {
    return recentImportantEvents
      .filter(e => e.eventType === type)
      .slice(0, count);
  }
  return recentImportantEvents.slice(0, count);
};
```

## Praktické ukázky

### Použití middleware pro autentifikaci a autorizaci

```typescript
// Definice routy s ověřením oprávnění
app.get('/api/products', 
  jwtAuthMiddleware,  // Ověření JWT tokenu
  requirePermission('products', OperationType.SELECT, EntityType.MODEL),  // Kontrola oprávnění
  async (req, res) => {
    try {
      const products = await productService.findAll(req.queryOptions);
      return res.json(products);
    } catch (error) {
      logger.error('Error fetching products', { error });
      return res.status(500).json({ message: 'Chyba při načítání produktů' });
    }
  }
);

// Ruta s ověřením pro spouštění procedury
app.post('/api/reports/generate',
  jwtAuthMiddleware,
  requirePermission('generateReport', OperationType.EXECUTE, EntityType.PROCEDURE),
  async (req, res) => {
    try {
      const result = await reportService.generateReport(req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Error generating report', { error });
      return res.status(500).json({ message: 'Chyba při generování reportu' });
    }
  }
);
```

### Ruty pro správu oprávnění

```typescript
// Získání všech oprávnění pro uživatele
app.get('/api/permissions/my',
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const permissions = await permissionService.getUserPermissions(req.user.username);
      return res.json(permissions);
    } catch (error) {
      logger.error('Error fetching user permissions', { error });
      return res.status(500).json({ message: 'Chyba při načítání oprávnění' });
    }
  }
);

// Vytvoření nového oprávnění (pouze pro adminy)
app.post('/api/permissions',
  jwtAuthMiddleware,
  requirePermission('permissions', OperationType.INSERT, EntityType.MODEL),
  async (req, res) => {
    try {
      const permission = await permissionService.create(req.body);
      return res.status(201).json(permission);
    } catch (error) {
      logger.error('Error creating permission', { error });
      return res.status(500).json({ message: 'Chyba při vytváření oprávnění' });
    }
  }
);
```

## Konfigurace

Konfigurace autentifikace a autorizace je uložena v .env souboru:

```
# Autentifikace - JWT Token
JWT_SECRET=tajny_klic_pro_generovani_a_overeni_jwt_tokenu_mezi_nextjs_a_express
JWT_EXPIRES_IN=8h
JWT_ISSUER=nextjs-server
JWT_AUDIENCE=express-api

# Keycloak
KEYCLOAK_URL=http://localhost:8080/auth
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=express-api

# Autorizace
SKIP_PERMISSION_CHECK=false

# Autentifikace třetích stran
API_KEY_SECRET=tajny_klic_pro_generovani_a_overeni_api_klic_tretich_stran
API_KEY_HEADER=X-API-Key

# Logování a monitoring
LOG_LEVEL=debug
LOG_FOLDER=C:/logs/express-oracle-api
MAX_LOG_SIZE=20m
MAX_LOG_FILES=14d
```

## Integrace do aplikace

Pro integraci systému autentifikace a autorizace do Express aplikace je třeba:

1. Přidat middleware do app.ts
```typescript
import { jwtAuthMiddleware } from './middlewares/authentication';
import { apiKeyAuthMiddleware } from './middlewares/apiKeyAuth';
import { setupLogging } from './middlewares/requestLogger';

// Nejprve logování
setupLogging(app);

// Middleware pro autentifikaci
app.use(apiKeyAuthMiddleware);  // Nejprve kontrola API klíčů
app.use(jwtAuthMiddleware);     // Poté JWT tokeny
```

2. Použít middleware requirePermission pro zabezpečení rout

## Bezpečnostní doporučení

1. Pravidelně rotujte JWT klíče a API klíče
2. Používejte HTTPS pro všechnu komunikaci
3. Nastavte smysluplnou dobu expirace tokenů
4. Implementujte rate limiting pro prevenci brute force útoků
5. Monitorujte neúspěšné pokusy o přihlášení a podezřelé aktivity
6. Provádějte pravidelné bezpečnostní audity
7. Logujte všechny důležité bezpečnostní události