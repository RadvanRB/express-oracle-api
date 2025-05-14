# Řešení problémů se synchronizací Oracle databáze

## Problém se synchronizací

TypeORM má někdy problémy se správnou detekcí stavu sloupců v existujících tabulkách v Oracle databázi. To může vést k chybám jako:

```
ORA-01430: column being added already exists in table
```

Tato chyba nastává, když se TypeORM pokouší přidat sloupec, který už v tabulce existuje. To se často objevuje po přejmenování tabulek nebo po manuálních změnách schématu.

## Řešení problému

### Krok 1: Připojení k Oracle databázi

Připojte se k Oracle databázi pomocí SQL*Plus, SQL Developer nebo jiného klienta.

### Krok 2: Záloha dat (pokud obsahují důležité informace)

--SQL--
-- Vytvoření záložní tabulky
CREATE TABLE app_user_roles_backup AS SELECT * FROM app_user_roles;
```

### Krok 3: Odstranění problematické tabulky

--SQL--
-- Odstranění tabulky
DROP TABLE app_user_roles CASCADE CONSTRAINTS;
```

### Krok 4: Vyčištění metadat a cache objektů

--SQL--
-- Vyčištění cache objektů a recyklovaných objektů
PURGE RECYCLEBIN;

-- Invalidace cache objektů (vyžaduje oprávnění)
ALTER SYSTEM FLUSH SHARED_POOL;
```

### Krok 5: Spuštění aplikace s povolenou synchronizací

Po provedení těchto kroků spusťte aplikaci s povolenou synchronizací:

```typescript
synchronize: process.env.NODE_ENV === "development",
```

TypeORM by nyní měl vytvořit tabulku app_user_roles s kompletní strukturou podle definice entity.

## Alternativní řešení

### Použití migračních skriptů

Pro produkční prostředí je vhodnější použít migrační skripty místo automatické synchronizace, protože poskytují lepší kontrolu nad změnami databáze.

```bash
# Vygenerování migračního skriptu
npm run typeorm migration:generate -n CreateUserRolesTables

# Spuštění migrace
npm run typeorm migration:run
```

### Manuální vytvoření tabulky

Můžete také vytvořit tabulku manuálně pomocí SQL skriptu s přesnou strukturou:

--SQL--
CREATE TABLE app_user_roles (
  "userId" NUMBER NOT NULL,
  "roleId" NUMBER NOT NULL, 
  "roleName" VARCHAR2(50) NOT NULL,
  "isActive" NUMBER DEFAULT 1 NOT NULL,
  "description" VARCHAR2(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "PK_app_user_roles" PRIMARY KEY ("userId", "roleId")
);
```

## Prevence problémů v budoucnu

1. **Konzistentní použití prefixů** pro tabulky (app_, etl_, ...) od začátku projektu
2. **Používání migračních skriptů** pro produkční prostředí místo automatické synchronizace
3. **Pravidelné čištění databáze** během vývoje pro odstranění zapomenutých objektů
4. **Důkladné testování** změn názvů tabulek a sloupců před nasazením