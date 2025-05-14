# Řešení kolizí objektů v Oracle databázi

## Problém

Při spuštění aplikace může dojít k chybě:

```
ORA-00955: name is already used by an existing object
```

Tato chyba nastává, když se TypeORM pokouší vytvořit tabulku nebo jiný objekt, který již v databázi existuje. V Oracle databázi mohou po smazání tabulky zůstat související objekty jako indexy, constrainty, triggery nebo sekvence. Alternativně může v jiném schématu existovat tabulka se stejným názvem.

## Implementované řešení

K vyřešení tohoto problému s tabulkou `user_roles` jsme zvolili následující přístup:

1. Přejmenování tabulky v entity modelu:
   ```typescript
   // src/modules/app/userrole/models/UserRole.ts
   @Entity("app_user_roles") // Místo původního "user_roles"
   export class UserRole {
     // ...
   }
   ```

2. Toto řešení je jednodušší a bezpečnější než snaha odstraňovat existující objekty v databázi.

## Alternativní řešení - vyčištění databáze

Pokud potřebujete zachovat původní název tabulky nebo čelíte podobným kolizím s jinými objekty, můžete použít následující SQL skripty pro vyčištění databáze:

```sql
-- Skript pro odstranění všech objektů souvisejících s tabulkou USER_ROLES

-- Vypsat všechny constraint spojené s tabulkou
SELECT constraint_name, constraint_type, table_name 
FROM user_constraints 
WHERE table_name = 'USER_ROLES';

-- Vypsat všechny indexy spojené s tabulkou
SELECT index_name, index_type, table_name 
FROM user_indexes 
WHERE table_name = 'USER_ROLES';

-- Vypsat všechny triggery spojené s tabulkou
SELECT trigger_name, trigger_type, table_name 
FROM user_triggers 
WHERE table_name = 'USER_ROLES';

-- Odstranit všechny constrainty (primární klíče, cizí klíče atd.)
-- Nahraďte CONSTRAINT_NAME konkrétními názvy z výpisu výše
BEGIN
  FOR c IN (SELECT constraint_name FROM user_constraints WHERE table_name = 'USER_ROLES') LOOP
    EXECUTE IMMEDIATE 'ALTER TABLE USER_ROLES DROP CONSTRAINT ' || c.constraint_name;
  END LOOP;
END;
/

-- Odstranit všechny indexy
-- Nahraďte INDEX_NAME konkrétními názvy z výpisu výše
BEGIN
  FOR i IN (SELECT index_name FROM user_indexes WHERE table_name = 'USER_ROLES') LOOP
    EXECUTE IMMEDIATE 'DROP INDEX ' || i.index_name;
  END LOOP;
END;
/

-- Odstranit všechny triggery
-- Nahraďte TRIGGER_NAME konkrétními názvy z výpisu výše
BEGIN
  FOR t IN (SELECT trigger_name FROM user_triggers WHERE table_name = 'USER_ROLES') LOOP
    EXECUTE IMMEDIATE 'DROP TRIGGER ' || t.trigger_name;
  END LOOP;
END;
/

-- Nakonec odstranit samotnou tabulku
DROP TABLE USER_ROLES PURGE;

-- Odstranit případné sekvence
-- Obvykle jsou pojmenované jako TABLE_NAME_SEQ
DECLARE
  seq_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO seq_exists FROM user_sequences WHERE sequence_name = 'USER_ROLES_SEQ';
  IF seq_exists > 0 THEN
    EXECUTE IMMEDIATE 'DROP SEQUENCE USER_ROLES_SEQ';
  END IF;
END;
/

-- Další možný přístup: čištění z pohledu ALL_OBJECTS
BEGIN
  FOR obj IN (SELECT object_name, object_type 
              FROM all_objects 
              WHERE object_name LIKE '%USER_ROLES%' 
              AND owner = 'SYSTEM') -- Nahraďte 'SYSTEM' vaším schématem
  LOOP
    BEGIN
      IF obj.object_type = 'TABLE' THEN
        EXECUTE IMMEDIATE 'DROP TABLE ' || obj.object_name || ' PURGE';
      ELSIF obj.object_type = 'INDEX' THEN
        EXECUTE IMMEDIATE 'DROP INDEX ' || obj.object_name;
      ELSIF obj.object_type = 'SEQUENCE' THEN
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || obj.object_name;
      ELSIF obj.object_type = 'TRIGGER' THEN
        EXECUTE IMMEDIATE 'DROP TRIGGER ' || obj.object_name;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Chyba při odstraňování ' || obj.object_type || ' ' || obj.object_name || ': ' || SQLERRM);
    END;
  END LOOP;
END;
/
```

## Obecné zásady pro řešení kolizí v Oracle

1. **Přejmenování tabulek**: Nejjednodušší řešení je přidat k názvům tabulek aplikační prefix, který zajistí, že se nebudou překrývat s existujícími systémovými tabulkami nebo tabulkami jiných aplikací.

2. **Změna schématu**: Pokud máte přístup k vytváření nových schémat v Oracle, zvažte používání vyhrazeného schématu pro vaši aplikaci.

3. **Dočasné vypnutí synchronizace**: V případě problémů můžete dočasně vypnout automatickou synchronizaci:
   ```typescript
   synchronize: false,
   ```

4. **Použití migrací**: Pro produkční prostředí je vždy bezpečnější používat migrační skripty místo automatické synchronizace.

## Prevence problémů do budoucna

Pro prevenci podobných kolizí do budoucna doporučujeme:

1. **Používat konzistentní prefixy pro tabulky**: Např. `app_`, `etl_`, apod.
2. **Používat migrační skripty** místo automatické synchronizace v produkčním prostředí
3. **Mít separátní databázi** pro vývoj, testy a produkci
4. **Pravidelně udržovat** čistou vývojovou databázi
5. **Při práci s Oracle** vždy používat `PURGE` při mazání tabulek
6. **Kontrolovat existující objekty** před vytvořením nových entit

Prefixy tabulek jsou zvláště důležité v Oracle, kde mnoho systémových tabulek a pohledů nemá konzistentní pojmenovací schéma a může kolidovat s běžnými názvy, které byste chtěli použít pro vaše aplikační tabulky.