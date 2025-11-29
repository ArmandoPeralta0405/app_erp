-- =====================================================
-- FUNCIONES RUC PARAGUAYO - ALGORITMO CORRECTO
-- Basado en el algoritmo oficial de la SET (Paraguay)
-- =====================================================

-- =====================================================
-- 1. FUNCIÓN: Calcular Dígito Verificador del RUC
-- Algoritmo Base 11 usado por la SET de Paraguay
-- =====================================================

DROP FUNCTION IF EXISTS calcular_dv_ruc(VARCHAR);

CREATE FUNCTION calcular_dv_ruc(ruc_sin_dv VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    k INTEGER := 2;
    suma INTEGER := 0;
    digito INTEGER;
    dv INTEGER;
    i INTEGER;
    ruc_length INTEGER;
    ruc_reversed VARCHAR;
BEGIN
    -- Validar que el RUC no esté vacío
    IF ruc_sin_dv IS NULL OR LENGTH(TRIM(ruc_sin_dv)) = 0 THEN
        RAISE EXCEPTION 'El RUC no puede estar vacío';
    END IF;

    -- Validar que el RUC sea numérico
    IF ruc_sin_dv !~ '^[0-9]+$' THEN
        RAISE EXCEPTION 'El RUC debe contener solo números';
    END IF;

    ruc_length := LENGTH(ruc_sin_dv);

    -- Algoritmo Base 11 de Paraguay
    -- Se multiplica cada dígito de DERECHA a IZQUIERDA por 2,3,4,5,6,7,8,9,2,3,4,5...
    FOR i IN 1..ruc_length LOOP
        -- Obtener dígito de derecha a izquierda
        digito := CAST(SUBSTRING(ruc_sin_dv FROM (ruc_length - i + 1) FOR 1) AS INTEGER);
        
        -- Multiplicar por el factor k (2-9, luego se repite)
        suma := suma + (digito * k);
        
        -- Incrementar k
        k := k + 1;
        
        -- Si k llega a 10, vuelve a 2
        IF k > 9 THEN
            k := 2;
        END IF;
    END LOOP;

    -- Calcular el resto de la división por 11
    dv := suma % 11;
    
    -- El DV es 11 - resto
    dv := 11 - dv;
    
    -- Si el resultado es 11, el DV es 0
    IF dv = 11 THEN
        dv := 0;
    END IF;
    
    -- Si el resultado es 10, el DV es 0 (según SET Paraguay)
    IF dv = 10 THEN
        dv := 0;
    END IF;

    RETURN dv;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 2. FUNCIÓN: Validar RUC Completo
-- =====================================================

DROP FUNCTION IF EXISTS validar_ruc_completo(VARCHAR);

CREATE FUNCTION validar_ruc_completo(ruc_completo VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    ruc_sin_dv VARCHAR;
    dv_ingresado INTEGER;
    dv_calculado INTEGER;
    ruc_length INTEGER;
BEGIN
    -- Validar que el RUC no esté vacío
    IF ruc_completo IS NULL OR LENGTH(TRIM(ruc_completo)) = 0 THEN
        RETURN FALSE;
    END IF;

    -- Validar que el RUC sea numérico
    IF ruc_completo !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;

    ruc_length := LENGTH(ruc_completo);

    -- El RUC debe tener al menos 2 dígitos
    IF ruc_length < 2 THEN
        RETURN FALSE;
    END IF;

    -- Separar RUC y DV (último dígito)
    ruc_sin_dv := SUBSTRING(ruc_completo FROM 1 FOR ruc_length - 1);
    dv_ingresado := CAST(SUBSTRING(ruc_completo FROM ruc_length FOR 1) AS INTEGER);

    -- Calcular el DV esperado
    dv_calculado := calcular_dv_ruc(ruc_sin_dv);

    -- Comparar
    RETURN dv_ingresado = dv_calculado;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 3. FUNCIÓN: Formatear RUC con DV
-- =====================================================

DROP FUNCTION IF EXISTS formatear_ruc_con_dv(VARCHAR);

CREATE FUNCTION formatear_ruc_con_dv(ruc_sin_dv VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    dv INTEGER;
BEGIN
    dv := calcular_dv_ruc(ruc_sin_dv);
    RETURN ruc_sin_dv || '-' || dv::VARCHAR;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PRUEBAS CON RUCs REALES DE PARAGUAY
-- =====================================================

-- Prueba con tu RUC
SELECT 
    '5955455' AS ruc_sin_dv,
    calcular_dv_ruc('5955455') AS dv_calculado,
    'Esperado: 0' AS nota;
-- Resultado esperado: 0

-- Prueba validación
SELECT 
    '59554550' AS ruc_completo,
    validar_ruc_completo('59554550') AS es_valido,
    'Debería ser TRUE' AS nota;

-- Prueba formateo
SELECT 
    '5955455' AS ruc_sin_dv,
    formatear_ruc_con_dv('5955455') AS ruc_formateado,
    'Esperado: 5955455-0' AS nota;

-- Más pruebas con RUCs conocidos
SELECT 
    ruc_sin_dv,
    calcular_dv_ruc(ruc_sin_dv) AS dv,
    formatear_ruc_con_dv(ruc_sin_dv) AS ruc_completo
FROM (
    VALUES 
        ('5955455'),
        ('80012345'),
        ('1234567')
) AS t(ruc_sin_dv);

-- =====================================================
-- VERIFICAR CREACIÓN
-- =====================================================

SELECT 
    routine_name AS nombre_funcion,
    routine_type AS tipo,
    data_type AS tipo_retorno
FROM information_schema.routines
WHERE routine_name IN ('calcular_dv_ruc', 'validar_ruc_completo', 'formatear_ruc_con_dv')
ORDER BY routine_name;

-- =====================================================
-- EXPLICACIÓN DEL ALGORITMO
-- =====================================================

/*
ALGORITMO BASE 11 DE PARAGUAY (SET):

Ejemplo con RUC: 5955455

Paso 1: Multiplicar cada dígito de DERECHA a IZQUIERDA por 2,3,4,5,6,7,8,9...
        
        5  9  5  5  4  5  5
        ×  ×  ×  ×  ×  ×  ×
        8  7  6  5  4  3  2
        
        = 40 + 63 + 30 + 25 + 16 + 15 + 10 = 199

Paso 2: Calcular resto de 199 ÷ 11
        199 % 11 = 1

Paso 3: DV = 11 - resto
        DV = 11 - 1 = 10

Paso 4: Si DV = 10 o DV = 11, entonces DV = 0
        DV = 0

Resultado: 5955455-0
*/
