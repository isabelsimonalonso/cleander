# Los SQL, y en qué orden van

**Esto es lo que hay que leer antes de montar la base de datos desde cero.**
No basta con `01_esquema.sql`: ese archivo crea solo las cuatro tablas
originales. Las denuncias, la auditoría, la moderación de fotos, el bloqueo y
media docena de cosas más viven en los archivos siguientes, y el orden importa
porque unos se apoyan en otros.

Se pegan uno a uno en *SQL Editor → New query* y se pulsa **Run**. Todos se
pueden ejecutar más de una vez sin romper nada.

## El orden

| Paso | Archivo | Qué hace |
|---|---|---|
| 1 | `01_esquema.sql` | Las cuatro tablas, RLS, los triggers del match y el almacén de fotos |
| 2 | — | **Regístrate en la web** con `admin@cleander.app` (ver `02_admin.sql`) |
| 3 | `02_admin.sql` | Convierte esa cuenta en administradora |
| 4 | `04_avisos_matches.sql` | El contador rojo sobre «Matches» para quien no se enteró |
| 5 | `05_valoraciones_por_invitacion.sql` | Solo valoras a quien has hecho match |
| 6 | `06_voto_definitivo.sql` | Una valoración no se cambia |
| 7 | `08_valoraciones_privadas.sql` | Las valoraciones dejan de delatar quién hizo match con quién |
| 8 | `09_bloqueo_real.sql` | Que un bloqueado no pueda seguir usando la web |
| 9 | `10_moderacion_fotos.sql` | Las fotos también pasan por moderación |
| 10 | `10b_moderacion_fotos_vistas.sql` | …lo que ven las tarjetas |
| 11 | `10c_moderacion_fotos_admin.sql` | …y lo que ve el panel |
| 12 | `12_borrado_completo.sql` | Borrar una cuenta se lo lleva todo |
| 13 | `13_bloqueado_en_matches.sql` | Un bloqueado desaparece de los matches ajenos |
| 14 | `14_denuncias.sql` | **La tabla `denuncias`** |
| 15 | `14b_denuncias_panel.sql` | Lo que el panel enseña de ellas |
| 16 | `15_deshacer_y_eliminar.sql` | Deshacer un descarte, eliminar un match |
| 17 | `16_descubrir_mejorado.sql` | El mazo, con filtro de precio y mejor orden |
| 18 | `17_auditoria.sql` | **La tabla `auditoria`** |
| 19 | `18_denuncias_mejoradas.sql` | Denuncias con motivo y estado |
| 20 | `19_mis_denuncias.sql` | Que quien denuncia vea a quién denunció |
| 21 | `20_aviso_denuncia_resuelta.sql` | El aviso verde al resolverse |
| 22 | `21_archivar_denuncias.sql` | Archivar una ya resuelta |
| 23 | `22_unidad_precio.sql` | Por hora o por día |
| 24 | `23_quitar_tabla_suelta.sql` | Quita una tabla huérfana que Supabase dejó suelta |
| 25 | `24_almacen_fotos.sql` | Impide que se pueda listar el almacén de fotos entero |
| 26 | `25_avisos_del_linter.sql` | Lo que pide el Security Advisor de Supabase |

**No hay `07` ni `11`.** Esos números no existen en la carpeta; no falta nada.

## Opcionales

| Archivo | Cuándo |
|---|---|
| `26_semilla.sql` | 486 perfiles de muestra, para que la web no parezca vacía |
| `27_usuario_demo.sql` | Las cuentas `democliente` y `demoservicio` |
| `28_valoraciones_muestra.sql` | Estrellas para esos perfiles. **Va después del 26** |
| `03_reiniciar_pruebas.sql` | Herramienta suelta: borra likes y matches para volver a probar. No es parte del montaje |

## Cómo comprobar que no falta nada

Tiene que haber **seis** tablas:

```sql
select tablename from pg_tables
where schemaname = 'public'
order by tablename;
-- auditoria · denuncias · intereses · matches · perfiles · valoraciones
```

Si salen solo cuatro, te has quedado en el `01`.
