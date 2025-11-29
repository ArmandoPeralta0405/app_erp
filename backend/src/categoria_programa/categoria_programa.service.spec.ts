import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaProgramaService } from './categoria_programa.service';

describe('CategoriaProgramaService', () => {
  let service: CategoriaProgramaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriaProgramaService],
    }).compile();

    service = module.get<CategoriaProgramaService>(CategoriaProgramaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
