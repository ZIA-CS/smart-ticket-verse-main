import { EntitySchema } from 'typeorm';

export const Event = new EntitySchema({
  name: 'Event',
  tableName: 'events',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    title: {
      type: 'varchar',
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    eventDate: {
      type: 'timestamp',
      nullable: false,
    },
    location: {
      type: 'varchar',
      nullable: false,
    },
    capacity: {
      type: 'integer',
      default: 100,
    },
    createdBy: {
      type: 'uuid',
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
