import { EntitySchema } from 'typeorm';

export const Ticket = new EntitySchema({
  name: 'Ticket',
  tableName: 'tickets',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    eventId: {
      type: 'uuid',
      nullable: false,
    },
    userId: {
      type: 'uuid',
      nullable: false,
    },
    ticketCode: {
      type: 'varchar',
      unique: true,
      nullable: false,
    },
    status: {
      type: 'varchar',
      default: 'active',
      nullable: false,
    },
    usedAt: {
      type: 'timestamp',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
});
