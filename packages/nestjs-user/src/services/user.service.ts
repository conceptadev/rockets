import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  public users: User[] = [
    {
      id: '1',
      username: 'first_user',
      // Encrypted for AS12378
      password: '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      salt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
    },
    {
      id: '2',
      username: 'second_user',
      // Encrypted for AS12378
      password: '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      salt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
    },
  ];

  async getUserByUsername(username: string): Promise<User> {
    const user: User = this.users.find((user) => {
      return user.username === username;
    });
    return new Promise<User>((resolve) => {
      resolve(user);
    });
  }
}
