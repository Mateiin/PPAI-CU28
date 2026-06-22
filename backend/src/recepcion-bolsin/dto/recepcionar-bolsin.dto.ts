import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, ValidateNested } from 'class-validator';

export class OpcionRecepcionDto {
  @IsInt()
  documentacionId: number;

  @IsIn(['aceptar', 'rechazar', 'faltante', 'redirigir'])
  opcion: 'aceptar' | 'rechazar' | 'faltante' | 'redirigir';
}

export class RecepcionarBolsinDto {
  @IsInt()
  usuarioId: number;

  @IsInt()
  bolsinId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpcionRecepcionDto)
  opciones: OpcionRecepcionDto[];
}
