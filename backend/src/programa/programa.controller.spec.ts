import { Test, TestingModule } from '@nestjs/testing';
import { ProgramaController } from './programa.controller';

describe('ProgramaController', () => {
  let controller: ProgramaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramaController],
    }).compile();

    controller = module.get<ProgramaController>(ProgramaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
