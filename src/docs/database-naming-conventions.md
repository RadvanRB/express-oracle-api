# Konvence pojmenování databázových objektů

## Úvod

Tento dokument definuje standardní konvence pro pojmenování databázových objektů v aplikaci. Správné pojmenování je klíčové pro:
- Předcházení kolizím s existujícími objekty v databázi
- Zlepšení čitelnosti a organizace databázového schématu
- Usnadnění správy a údržby databázových objektů

## Prefixy pro tabulky podle modulů

Pro zajištění jasného oddělení tabulek různých modulů a prevenci kolizí s jinými tabulkami používáme systematické prefixy pro názvy tabulek:

| Modul      | Prefix | Příklad               |
|------------|--------|------------------------|
| app        | app_   | app_users, app_roles   |
| etlcore    | etl_   | etl_products          |
| interfaces | if_    | if_data_sources       |
| jlout      | jl_    | jl_transfers          |

## Implementované změny

V rámci sjednocení pojmenování jsme provedli následující změny:

### Modul app:

| Původní název     | Nový název           |
|------------------|------------------------|
| api_keys         | app_api_keys          |
| permissions      | app_permissions       |
| roles            | app_roles             |
| user_roles       | app_user_roles        |
| users            | app_users             |
| role_permissions | app_role_permissions  |

### Vazební tabulky:

Pro vazební tabulky (many-to-many vztahy) používáme prefixy podle hlavního modulu:

- `app_role_permissions`: Vazební tabulka mezi rolemi a oprávněními
- `app_user_roles`: Vazební tabulka mezi uživateli a rolemi

## Zásady pojmenování

1. **Prefixy podle modulů**: Každá tabulka patřící k modulu musí mít odpovídající prefix.
2. **Názvy v angličtině**: Používáme anglické názvy pro všechny databázové objekty.
3. **Množné číslo**: Názvy tabulek jsou v množném čísle (users, not user).
4. **Snake case**: Pro víceslovné názvy používáme snake_case (user_roles, not userRoles).
5. **Konzistence**: Zachovávejte konzistenci v celém projektu.

## Výhody prefixů

1. **Prevence kolizí**: Zejména v Oracle databázi mohou prefixy zabránit kolizím s existujícími systémovými tabulkami nebo tabulkami jiných aplikací.
2. **Organizace**: Prefixy usnadňují filtrování a identifikaci tabulek patřících ke konkrétnímu modulu.
3. **Bezpečnost**: Snižují riziko neúmyslných změn v systémových tabulkách.

## Doporučení pro vývoj

1. **Důsledná aplikace prefixů**: Při vytváření nových entit vždy používejte odpovídající prefix podle modulu.
2. **Kontrola existujících objektů**: Před vytvořením nových entit zkontrolujte, zda v databázi již neexistují objekty se stejným názvem.
3. **Migrace**: V produkčním prostředí používejte migrační skripty místo automatické synchronizace.
4. **Dokumentace**: Udržujte aktuální dokumentaci databázového schématu.

## Řešení kolizí

Pokud narazíte na kolizi s existujícími objekty v databázi:

1. **Přejmenování tabulky**: Přidejte nebo změňte prefix entity v dekorátoru `@Entity`.
2. **Úprava vazebních tabulek**: Nezapomeňte aktualizovat i názvy vazebních tabulek v `@JoinTable` dekorátorech.
3. **Vypnutí synchronizace**: Při problémech lze dočasně vypnout synchronizaci databáze nastavením `synchronize: false`.
4. **Ruční úprava databáze**: V některých případech může být nutné ručně odstranit nebo upravit objekty v databázi.