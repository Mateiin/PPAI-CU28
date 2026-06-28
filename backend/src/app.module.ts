import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecepcionBolsinModule } from './recepcion-bolsin/recepcion-bolsin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        database: cfg.get('DB_NAME', 'bolsines'),
        username: cfg.get('DB_USER', 'postgres'),
        password: cfg.get('DB_PASSWORD', 'postgres'),
        synchronize: cfg.get('DB_SYNCHRONIZE') === 'true',
        autoLoadEntities: true,
      }),
    }),
    RecepcionBolsinModule,
  ],
})
export class AppModule {}
