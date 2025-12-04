import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

@Controller('terminal')
export class TerminalController {
    constructor(private readonly terminalService: TerminalService) { }

    @Post()
    create(@Body() createTerminalDto: CreateTerminalDto) {
        return this.terminalService.create(createTerminalDto);
    }

    @Get()
    findAll() {
        return this.terminalService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.terminalService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTerminalDto: UpdateTerminalDto,
    ) {
        return this.terminalService.update(id, updateTerminalDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.terminalService.remove(id);
    }
}
