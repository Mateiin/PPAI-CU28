import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bolsin } from './entities/bolsin.entity';
import { Documentacion } from './entities/documentacion.entity';
import { Remito } from './entities/remito.entity';
import { DetalleRemito } from './entities/detalle-remito.entity';
import { Empleado } from './entities/empleado.entity';
import { Usuario } from './entities/usuario.entity';
import { Sesion } from './entities/sesion.entity';
import { TipoDocumento } from './entities/tipo-documento.entity';
import { ComisionMedica } from './entities/comision-medica.entity';
import { Estado } from './entities/estado.entity';
import { CambioEstadoBolsin } from './entities/control-estado-bolsin.entity';
import { CambioEstadoDocumentacion } from './entities/control-estado-documentacion.entity';


import { GestorRegRecepBolsin } from './service/gestor-reg-recep-bolsin.service';
import { RepositoriosCU28 } from './repository/repositorios-cu28.service';
import { RecepcionBolsinController } from './controller/recepcion-bolsin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bolsin,
      Documentacion,
      Remito,
      DetalleRemito,
      Empleado,
      Usuario,
      Sesion,
      TipoDocumento,
      ComisionMedica,
      Estado,
      CambioEstadoBolsin,
      CambioEstadoDocumentacion,
    ]),
  ],
  controllers: [RecepcionBolsinController],
  providers: [RepositoriosCU28, GestorRegRecepBolsin],
})
export class RecepcionBolsinModule {}
