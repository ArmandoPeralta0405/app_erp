import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaProgramaController } from './categoria_programa.controller';

describe('CategoriaProgramaController', () => {
  let controller: CategoriaProgramaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaProgramaController],
    }).compile();

    controller = module.get<CategoriaProgramaController>(CategoriaProgramaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
