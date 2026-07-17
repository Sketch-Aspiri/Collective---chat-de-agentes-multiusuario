import { Request, Response } from 'express';
import { agentsService } from './agents.service';
import { executeAgentMention } from './agent-execution';

export class AgentsController {
  async create(req: Request, res: Response): Promise<void> {
    const agent = await agentsService.create(req.body);
    res.status(201).json({ success: true, data: agent, error: null });
  }

  async listForChat(req: Request, res: Response): Promise<void> {
    const agents = await agentsService.listForChat(req.params.chatId);
    res.status(200).json({ success: true, data: agents, error: null });
  }

  async execute(req: Request, res: Response): Promise<void> {
    const reply = await executeAgentMention(req.params.id, req.body.prompt);
    res.status(200).json({ success: true, data: { reply }, error: null });
  }
}

export const agentsController = new AgentsController();
