import { EntitySchema } from 'typeorm';

export const Result = new EntitySchema({
  name: 'Result',
  tableName: 'results',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    userId: {
      type: 'uuid',
      nullable: false,
    },
    eventId: {
      type: 'uuid',
      nullable: false,
    },
    ticketId: {
      type: 'uuid',
      nullable: false,
    },
    status: {
      type: 'varchar',
      nullable: false,
      default: 'pending',
    },
    scannedAt: {
      type: 'timestamp',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});
