import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bolsin } from '../entities/bolsin.entity';
import { Remito } from '../entities/remito.entity';
import { Documentacion } from '../entities/documentacion.entity';
import { DetalleRemito } from '../entities/detalle-remito.entity';
import { Sesion } from '../entities/sesion.entity';
import { Estado } from '../entities/estado.entity';
import { Empleado } from '../entities/empleado.entity';
import { Usuario } from '../entities/usuario.entity';
import { TipoDocumento } from '../entities/tipo-documento.entity';
import { ComisionMedica } from '../entities/comision-medica.entity';
import { CambioEstadoBolsin } from '../entities/control-estado-bolsin.entity';
import { CambioEstadoDocumentacion } from '../entities/control-estado-documentacion.entity';

@Injectable()
export class RepositoriosCU28 {
  constructor(
    @InjectRepository(Bolsin)
    readonly bolsinRepo: Repository<Bolsin>,

    @InjectRepository(Remito)
    readonly remitoRepo: Repository<Remito>,

    @InjectRepository(Documentacion)
    readonly documentacionRepo: Repository<Documentacion>,

    @InjectRepository(DetalleRemito)
    readonly detalleRemitoRepo: Repository<DetalleRemito>,

    @InjectRepository(Sesion)
    readonly sesionRepo: Repository<Sesion>,

    @InjectRepository(Estado)
    readonly estadoRepo: Repository<Estado>,

    @InjectRepository(Empleado)
    readonly empleadoRepo: Repository<Empleado>,

    @InjectRepository(Usuario)
    readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(TipoDocumento)
    readonly tipoDocumentoRepo: Repository<TipoDocumento>,

    @InjectRepository(ComisionMedica)
    readonly comisionMedicaRepo: Repository<ComisionMedica>,

    @InjectRepository(CambioEstadoBolsin)
    readonly cambioEstadoBolsinRepo: Repository<CambioEstadoBolsin>,

    @InjectRepository(CambioEstadoDocumentacion)
    readonly cambioEstadoDocumentacionRepo: Repository<CambioEstadoDocumentacion>,
  ) {}
}
