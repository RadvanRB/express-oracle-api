# Filtrování dat v API

Tento dokument popisuje, jak používat filtrování dat v API, včetně podpory pro logické operátory AND a OR.

## Dva způsoby filtrování

API podporuje dva způsoby zápisu filtrů:

### 1. Nový formát s podporou logických operátorů (doporučeno)

Tento formát umožňuje kombinovat filtry pomocí logických operátorů AND a OR, včetně vnořování.

**Základní syntaxe:**
```
filter[pole][operator]=hodnota
```

**Logické operátory:**
```
filter[or][0][pole][operator]=hodnota&filter[or][1][pole2][operator]=hodnota
filter[and][0][pole][operator]=hodnota&filter[and][1][pole2][operator]=hodnota
```

**Vnořené logické operátory:**
```
filter[or][0][pole][operator]=hodnota&filter[or][1][and][0][pole2][operator]=hodnota&filter[or][1][and][1][pole3][operator]=hodnota
```

### 2. Původní formát (pro zpětnou kompatibilitu)

Tento formát umožňuje jednoduché filtrování, ale nepodporuje logické operátory OR a vnořené filtry.

**Syntaxe:**
```
pole@operator=hodnota
```

## Dostupné operátory

| Operátor | Popis | Nový formát | Původní formát |
|----------|-------|-------------|----------------|
| eq | Rovná se | filter[pole][eq]=hodnota | pole@EQ=hodnota |
| ne | Nerovná se | filter[pole][ne]=hodnota | pole@NE=hodnota |
| gt | Větší než | filter[pole][gt]=hodnota | pole@GT=hodnota |
| gte | Větší nebo rovno | filter[pole][gte]=hodnota | pole@GTE=hodnota |
| lt | Menší než | filter[pole][lt]=hodnota | pole@LT=hodnota |
| lte | Menší nebo rovno | filter[pole][lte]=hodnota | pole@LTE=hodnota |
| like | Obsahuje (case sensitive) | filter[pole][like]=hodnota | pole@LIKE=hodnota |
| ilike | Obsahuje (case insensitive) | filter[pole][ilike]=hodnota | pole@ILIKE=hodnota |
| in | V seznamu | filter[pole][in]=hodnota1,hodnota2 | pole@IN=hodnota1,hodnota2 |
| not_in | Není v seznamu | filter[pole][not_in]=hodnota1,hodnota2 | pole@NOT_IN=hodnota1,hodnota2 |
| is_null | Je null | filter[pole][is_null]=true | pole@IS_NULL=true |
| is_not_null | Není null | filter[pole][is_not_null]=true | pole@IS_NOT_NULL=true |

### Operátory pro datumy

| Operátor | Popis | Nový formát | Původní formát |
|----------|-------|-------------|----------------|
| date_eq | Rovná se datu | filter[pole][date_eq]=2023-01-01 | pole@DATE_EQ=2023-01-01 |
| date_ne | Nerovná se datu | filter[pole][date_ne]=2023-01-01 | pole@DATE_NE=2023-01-01 |
| date_before | Před datem | filter[pole][date_before]=2023-01-01 | pole@DATE_BEFORE=2023-01-01 |
| date_after | Po datu | filter[pole][date_after]=2023-01-01 | pole@DATE_AFTER=2023-01-01 |
| date_between | Mezi datumy | filter[pole][date_between]=2023-01-01,2023-12-31 | pole@DATE_BETWEEN=2023-01-01,2023-12-31 |
| date_today | Dnešní datum | filter[pole][date_today]=true | pole@DATE_TODAY=true |
| date_yesterday | Včerejší datum | filter[pole][date_yesterday]=true | pole@DATE_YESTERDAY=true |
| date_this_week | Tento týden | filter[pole][date_this_week]=true | pole@DATE_THIS_WEEK=true |
| date_this_month | Tento měsíc | filter[pole][date_this_month]=true | pole@DATE_THIS_MONTH=true |
| date_this_year | Tento rok | filter[pole][date_this_year]=true | pole@DATE_THIS_YEAR=true |

## Příklady použití

### Základní filtrování

**Nový formát:**
```
/api/products?filter[name][eq]=Notebook
/api/products?filter[price][gt]=1000
/api/products?filter[category][like]=Elektronika
```

**Původní formát:**
```
/api/products?name@EQ=Notebook
/api/products?price@GT=1000
/api/products?category@LIKE=Elektronika
```

### Logické operátory (pouze nový formát)

#### OR - Logický operátor NEBO

Najde produkty, které mají název obsahující "Notebook" NEBO cenu vyšší než 1000:
```
/api/products?filter[or][0][name][like]=Notebook&filter[or][1][price][gt]=1000
```

#### AND - Logický operátor A

Najde produkty, které mají název obsahující "Notebook" A zároveň cenu vyšší než 1000:
```
/api/products?filter[and][0][name][like]=Notebook&filter[and][1][price][gt]=1000
```

### Vnořené logické operátory (pouze nový formát)

#### OR s vnořeným AND

Najde produkty, které mají název obsahující "Samsung" NEBO (cenu vyšší než 100 A kategorii "Elektronika"):
```
/api/products?filter[or][0][name][like]=Samsung&filter[or][1][and][0][price][gt]=100&filter[or][1][and][1][category][eq]=Elektronika
```

Vygenerovaná SQL podmínka bude vypadat přibližně takto:
```sql
WHERE ("product"."name" LIKE '%Samsung%') OR (("product"."price" > 100) AND ("product"."category" = 'Elektronika'))
```

Je důležité si všimnout, že vnořené logické operátory jsou správně zachovány a operátory jako `gt` (větší než) jsou korektně převedeny na SQL operátor `>`.

#### AND s vnořeným OR

Najde produkty, které mají kategorii "Elektronika" A zároveň (název obsahuje "Telefon" NEBO cenu nižší než 5000):
```
/api/products?filter[and][0][category][eq]=Elektronika&filter[and][1][or][0][name][like]=Telefon&filter[and][1][or][1][price][lt]=5000
```

### Víceúrovňové vnořování

Najde produkty, které (mají název obsahující "Samsung" A barvu "černá") NEBO (mají cenu vyšší než 1000 A kategorii "Elektronika" A subkategorii "Telefony"):
```
/api/products?filter[or][0][and][0][name][like]=Samsung&filter[or][0][and][1][color][eq]=černá&filter[or][1][and][0][price][gt]=1000&filter[or][1][and][1][category][eq]=Elektronika&filter[or][1][and][2][subCategory][eq]=Telefony
```

## Kombinace s řazením a stránkováním

API podporuje kombinaci filtrů s řazením a stránkováním:

```
/api/products?filter[price][gt]=1000&sort=name:asc,price:desc&page=1&limit=10
```

Tento dotaz najde produkty s cenou vyšší než 1000, seřadí je podle názvu vzestupně a podle ceny sestupně, a vrátí první stránku s 10 položkami.

## Dostupné formáty filtrů

API podporuje dva způsoby zápisu filtrů:

### 1. Nový formát s podporou logických operátorů AND a OR

Nový formát umožňuje vytvářet složitější filtry s podporou logických operátorů AND a OR, které mohou být i vnořené.

#### Základní syntaxe:

```
filter[pole][operator]=hodnota
filter[logicalOperator][index][pole][operator]=hodnota
```

#### Příklady:

##### Jednoduchý filtr:
```
GET /api/produkty?filter[nazev][eq]=Produkt1
```
Vrátí produkty, kde název je přesně "Produkt1".

```
GET /api/produkty?filter[cena][gt]=100
```
Vrátí produkty, kde cena je větší než 100.

##### Použití OR operátoru:
```
GET /api/produkty?filter[or][0][nazev][like]=Produkt&filter[or][1][popis][like]=Kvalitní
```
Vrátí produkty, kde název obsahuje "Produkt" NEBO popis obsahuje "Kvalitní".

##### Použití AND operátoru:
```
GET /api/produkty?filter[and][0][cena][gt]=100&filter[and][1][cena][lt]=500
```
Vrátí produkty, kde cena je větší než 100 A zároveň menší než 500.

##### Kombinace AND a OR operátorů:
```
GET /api/produkty?filter[or][0][nazev][like]=Produkt&filter[or][1][and][0][cena][gt]=100&filter[or][1][and][1][kategorie][eq]=elektronika
```
Vrátí produkty, kde název obsahuje "Produkt" NEBO (cena je větší než 100 A kategorie je "elektronika").

#### Důležité poznámky k operátorům ve vnořených filtrech

Při použití vnořených filtrů je potřeba správně strukturovat URL parametry:

1. Vnější logický operátor (`and` nebo `or`) následovaný indexem: `filter[or][0]`
2. Vnořený logický operátor následovaný indexem: `filter[or][1][and][0]`
3. Pole a operátor na nejnižší úrovni: `filter[or][1][and][0][price][gt]`

Operátory jsou zpracovány správně na všech úrovních, tedy například:
- `gt` se vždy převede na `>` (větší než)
- `lt` se vždy převede na `<` (menší než)
- `eq` se vždy převede na `=` (rovná se)

Při zpracování dotazu se všechny operátory na všech úrovních zachovávají a převádějí se na správné SQL podmínky.

### 2. Původní formát (pro zpětnou kompatibilitu)

Původní formát používá notaci s @ pro specifikaci operátoru.

#### Základní syntaxe:

```
pole@operator=hodnota
```

#### Příklady:

```
GET /api/produkty?nazev@EQ=Produkt1
```
Vrátí produkty, kde název je přesně "Produkt1".

```
GET /api/produkty?cena@GT=100
```
Vrátí produkty, kde cena je větší než 100.

## Dostupné operátory

### Základní operátory

| Operátor | Popis | Příklad |
|----------|-------|---------|
| eq, EQ   | Rovná se | filter[nazev][eq]=Produkt1 |
| ne, NE   | Nerovná se | filter[nazev][ne]=Produkt1 |
| gt, GT   | Větší než | filter[cena][gt]=100 |
| gte, GTE | Větší nebo rovno | filter[cena][gte]=100 |
| lt, LT   | Menší než | filter[cena][lt]=500 |
| lte, LTE | Menší nebo rovno | filter[cena][lte]=500 |
| like, LIKE | Obsahuje (case-sensitive) | filter[nazev][like]=Produkt |
| ilike, ILIKE | Obsahuje (case-insensitive) | filter[nazev][ilike]=produkt |
| in, IN   | Je v seznamu hodnot | filter[kategorie][in]=elektronika,nabytek |
| not_in, NOT_IN | Není v seznamu hodnot | filter[kategorie][not_in]=obleceni,potraviny |
| is_null, IS_NULL | Je NULL | filter[popis][is_null]=true |
| is_not_null, IS_NOT_NULL | Není NULL | filter[popis][is_not_null]=true |

### Datumové operátory

| Operátor | Popis | Příklad |
|----------|-------|---------|
| date_eq, DATE_EQ | Datum se rovná | filter[datum_vytvoreni][date_eq]=2023-01-01 |
| date_ne, DATE_NE | Datum se nerovná | filter[datum_vytvoreni][date_ne]=2023-01-01 |
| date_before, DATE_BEFORE, BEFORE | Datum je před | filter[datum_vytvoreni][date_before]=2023-01-01 |
| date_after, DATE_AFTER, AFTER | Datum je po | filter[datum_vytvoreni][date_after]=2023-01-01 |
| date_between, DATE_BETWEEN, BETWEEN | Datum je mezi | filter[datum_vytvoreni][date_between]=2023-01-01,2023-12-31 |
| date_not_between, DATE_NOT_BETWEEN, NOT_BETWEEN | Datum není mezi | filter[datum_vytvoreni][date_not_between]=2023-01-01,2023-12-31 |
| date_today, DATE_TODAY | Datum je dnes | filter[datum_vytvoreni][date_today]=true |
| date_yesterday, DATE_YESTERDAY | Datum je včera | filter[datum_vytvoreni][date_yesterday]=true |
| date_this_week, DATE_THIS_WEEK | Datum je v tomto týdnu | filter[datum_vytvoreni][date_this_week]=true |
| date_last_week, DATE_LAST_WEEK | Datum je v minulém týdnu | filter[datum_vytvoreni][date_last_week]=true |
| date_this_month, DATE_THIS_MONTH | Datum je v tomto měsíci | filter[datum_vytvoreni][date_this_month]=true |
| date_last_month, DATE_LAST_MONTH | Datum je v minulém měsíci | filter[datum_vytvoreni][date_last_month]=true |
| date_this_year, DATE_THIS_YEAR | Datum je v tomto roce | filter[datum_vytvoreni][date_this_year]=true |
| date_last_year, DATE_LAST_YEAR | Datum je v minulém roce | filter[datum_vytvoreni][date_last_year]=true |

## Řazení a stránkování

API také podporuje řazení a stránkování dat.

### Řazení

#### Nový formát:

```
sort=pole:směr,pole2:směr2
```

Příklad:
```
GET /api/produkty?sort=nazev:asc,cena:desc
```
Vrátí produkty seřazené vzestupně podle názvu a sestupně podle ceny.

#### Původní formát:

```
sortBy=pole&sortDirection=směr
```

Příklad:
```
GET /api/produkty?sortBy=nazev&sortDirection=asc
```
Vrátí produkty seřazené vzestupně podle názvu.

### Stránkování

```
page=číslo_stránky&limit=počet_záznamů
```

Příklad:
```
GET /api/produkty?page=1&limit=10
```
Vrátí první stránku s 10 produkty.

## Praktické příklady

### Jak SQL dotazy interpretují komplexní filtry

Pro komplexní vnořené filtry se generují SQL dotazy, které přesně odpovídají logické struktuře filtru. Například pro dotaz:

```
/api/produkty?filter[or][0][nazev][like]=Produkt&filter[or][1][and][0][cena][gt]=100&filter[or][1][and][1][skladem][eq]=true
```

Se vygeneruje SQL podmínka přibližně v tomto tvaru:
```sql
WHERE ("produkt"."nazev" LIKE '%Produkt%') OR (("produkt"."cena" > 100) AND ("produkt"."skladem" = true))
```

To zajišťuje, že všechny logické operátory (AND, OR) a všechny porovnávací operátory (=, >, <, LIKE, atd.) jsou správně převedeny a zachovány v konečném SQL dotazu, a to i při hlubokém vnořování.

### Kombinace filtrů, řazení a stránkování

```
GET /api/produkty?filter[or][0][nazev][like]=Produkt&filter[or][1][popis][like]=Kvalitní&sort=cena:asc&page=1&limit=20
```
Vrátí první stránku s 20 produkty, kde název obsahuje "Produkt" NEBO popis obsahuje "Kvalitní", seřazené vzestupně podle ceny.

### Vyhledání produktů v cenovém rozmezí s konkrétním klíčovým slovem v názvu

```
GET /api/produkty?filter[and][0][cena][gt]=100&filter[and][1][cena][lt]=500&filter[and][2][nazev][like]=Telefon&sort=cena:asc
```
Vrátí produkty, kde cena je mezi 100 a 500 A název obsahuje "Telefon", seřazené vzestupně podle ceny.

## Debugování filtrů

Systém filtrování poskytuje možnost debugování, které pomáhá vývojářům sledovat, jak jsou filtry zpracovávány. To je užitečné zejména při řešení problémů se složitými filtry a vnořenými logickými operátory.

### Aktivace debugového režimu

Debugový režim lze aktivovat nastavením proměnné prostředí `DEBUG_FILTERS` na hodnotu `true`. Toto nastavení zapne podrobné logování procesu zpracování filtrů.

#### Konfigurace v .env souboru:
```
DEBUG_FILTERS=true
```

### Zobrazované informace při debugování

Při aktivním debugování systém zobrazuje následující informace:

1. **Parsování URL parametrů** - Zobrazí strukturu přijatých parametrů filtru
2. **Zpracování operátorů** - Sleduje transformaci operátorů včetně odstranění hranatých závorek (např. `[gt]` -> `gt`)
3. **Vytváření filtrů** - Ukazuje, jak jsou jednotlivé parametry převáděny na strukturované objekty filtrů
4. **Aplikace filtrů** - Zobrazuje, jak jsou filtry aplikovány na dotaz

### Příklady debugovacích výpisů

Pro dotaz:
```
GET /api/produkty?filter[or][0][nazev][like]=Samsung&filter[or][1][and][0][cena][gt]=100&filter[or][1][and][1][kategorie][eq]=Elektronika
```

Systém zobrazí následující debugovací výpisy:

```
Parsování filtru z URL parametrů: {
  "or": [
    {
      "nazev": {
        "like": "Samsung"
      }
    },
    {
      "and": [
        {
          "cena": {
            "[gt]": "100"
          }
        },
        {
          "kategorie": {
            "[eq]": "Elektronika"
          }
        }
      ]
    }
  ]
}
Zpracování operátoru: původní 'like', po úpravě 'like'
Parsování pole: nazev, operátor 'like' se převádí na enum: like, hodnota: Samsung
Vytvořený filtr: {
  "field": "nazev",
  "operator": "like",
  "value": "Samsung"
}
Zpracování operátoru: původní '[gt]', po úpravě 'gt'
Parsování pole: cena, operátor '[gt]' se převádí na enum: gt, hodnota: 100
Vytvořený filtr: {
  "field": "cena",
  "operator": "gt",
  "value": 100
}
Zpracování operátoru: původní '[eq]', po úpravě 'eq'
Parsování pole: kategorie, operátor '[eq]' se převádí na enum: eq, hodnota: Elektronika
Vytvořený filtr: {
  "field": "kategorie",
  "operator": "eq",
  "value": "Elektronika"
}
Applying filter: {
  "operator": "or",
  "filters": [
    {
      "field": "nazev",
      "operator": "like",
      "value": "Samsung"
    },
    {
      "operator": "and",
      "filters": [
        {
          "field": "cena",
          "operator": "gt",
          "value": 100
        },
        {
          "field": "kategorie",
          "operator": "eq",
          "value": "Elektronika"
        }
      ]
    }
  ]
}
```

### Debugování pro řešení problémů

Debugovací výpisy jsou obzvláště užitečné pro identifikaci následujících problémů:

1. **Nesprávná interpretace operátorů** - např. zjištění, zda je operátor `[gt]` správně převeden na `gt` (větší než)
2. **Problémy s vnořenými filtry** - zobrazuje strukturu vnořených filtrů a jak jsou zpracovány
3. **Převod hodnot** - ukazuje, jak jsou hodnoty zpracovány a převedeny na správné typy (čísla, datum, boolean)

Debugování by mělo být aktivováno pouze během vývoje nebo ladění, nikoliv v produkčním prostředí, kde by mohlo vést k zahlcení logů a potenciálním bezpečnostním rizikům.