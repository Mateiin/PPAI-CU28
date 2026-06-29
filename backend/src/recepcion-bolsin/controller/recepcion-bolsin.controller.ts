import { Body, Controller, Get, Post, Query, ParseIntPipe } from '@nestjs/common';
import { GestorRegRecepBolsin } from '../service/gestor-reg-recep-bolsin.service';
import { RecepcionarBolsinDto } from '../dto/recepcionar-bolsin.dto';

@Controller('recepcion-bolsin')
export class RecepcionBolsinController {
  constructor(private readonly gestor: GestorRegRecepBolsin) {}

  @Get('bolsines')
  getBolsinesARecepcionar(@Query('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.gestor.getBolsinesARecepcionar(usuarioId);
  }

  @Post('recepcionar')
  recepcionar(@Body() dto: RecepcionarBolsinDto) {
    return this.gestor.registrarRecepcionDeBolsin(dto);
  }
}
