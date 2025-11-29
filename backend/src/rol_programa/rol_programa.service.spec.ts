import { Test, TestingModule } from '@nestjs/testing';
import { RolProgramaService } from './rol_programa.service';

describe('RolProgramaService', () => {
  let service: RolProgramaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolProgramaService],
    }).compile();

    service = module.get<RolProgramaService>(RolProgramaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
