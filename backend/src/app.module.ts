import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecepcionBolsinModule } from './recepcion-bolsin/recepcion-bolsin.module';

// console.log({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USERNAME,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_DATABASE
//     });
@Module({
  imports: [
    
    ConfigModule.forRoot({ isGlobal: true }),
//     TypeOrmModule.forRootAsync({
//   imports: [ConfigModule],
//   inject: [ConfigService],
//   useFactory: (cfg: ConfigService) => ({
//     type: 'postgres',
//     host: cfg.get('DB_HOST'),
//     port: cfg.get<number>('DB_PORT'),
//     username: cfg.get('DB_USER'),
//     password: cfg.get('DB_PASSWORD'),
//     database: cfg.get('DB_NAME'),

//     synchronize: true,

//     autoLoadEntities: true,

//     logging: true,

//     logger: 'advanced-console',
//   }),
// }),
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
        // synchronize: cfg.get('DB_SYNCHRONIZE') === 'true',
        synchronize: true,

        autoLoadEntities: true,
      }),
    }),
    RecepcionBolsinModule,
  ],
})
export class AppModule {}
