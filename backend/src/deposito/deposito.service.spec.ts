import { Test, TestingModule } from '@nestjs/testing';
import { DepositoService } from './deposito.service';

describe('DepositoService', () => {
  let service: DepositoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositoService],
    }).compile();

    service = module.get<DepositoService>(DepositoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
