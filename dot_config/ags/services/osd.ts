import { Variable } from 'astal';
import { Subscribable } from 'astal/binding';

export class OSDState implements Subscribable {
  private showing = new Variable<number>(0);

  constructor() {}

  get(): number {
    return this.showing.get();
  }

  open(): void {
    const count = this.showing.get() + 1;
    this.showing.set(count);
  }

  close(): void {
    const count = this.showing.get() - 1;
    this.showing.set(count);
  }

  subscribe(callback: (value: number) => void): () => void {
    return this.showing.subscribe(callback);
  }
}

export const OSDService = new OSDState();
