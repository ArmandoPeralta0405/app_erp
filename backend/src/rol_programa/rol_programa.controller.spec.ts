import { Test, TestingModule } from '@nestjs/testing';
import { RolProgramaController } from './rol_programa.controller';

describe('RolProgramaController', () => {
  let controller: RolProgramaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolProgramaController],
    }).compile();

    controller = module.get<RolProgramaController>(RolProgramaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
