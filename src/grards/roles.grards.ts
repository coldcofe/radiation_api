import * as jwt from 'jsonwebtoken';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ReflectMetadata } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import config from '../config';
import { User } from '../entity/user';
import { Repository } from 'typeorm';

export const Roles = (...roles: string[]) => ReflectMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly jwtSecret: string;
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.jwtSecret = config.get('JWT_SECRET');
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    if (!req.headers.authorization) {
      return false;
    }
    let decoded: any = jwt.verify(req.headers.authorization, this.jwtSecret);
    if (!decoded) {
      return false;
    }
    req.user = decoded;

    if (roles.length === 0) {
      return true;
    }
    const hasRole = roles.some(role => role === req.user.role);
    return hasRole;
  }
}