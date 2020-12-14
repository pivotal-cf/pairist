import { css } from 'astroturf';
import { ReactNode, useRef } from 'react';
import { Plus } from 'react-feather';
import { useParams } from 'react-router';
import * as listActions from '../actions/list';
import { useLists } from '../hooks/useLists';
import { RouteParams } from '../types';
import IconButton from './IconButton';
import List from './List';

export default function Lists() {
  const { teamId = '-' } = useParams<RouteParams>();
  const lists = useLists();
  const listsRef = useRef<HTMLUListElement>(null);

  async function createList() {
    await listActions.createList(teamId, {
      order: Date.now(),
    });

    if (listsRef.current) {
      const lastChild = listsRef.current.lastElementChild;
      if (lastChild) {
        const input = lastChild.querySelector('textarea');
        input && (input as HTMLElement).focus();
      }
    }
  }

  async function moveListDown(movedIndex: number) {
    if (movedIndex >= lists.length - 1) return;

    const movedList = lists[movedIndex];
    const movedListOrder = movedList.order;
    const swappedList = lists[movedIndex + 1];
    const swappedListOrder = swappedList.order;

    listActions.reorderLists(teamId, [
      { ...movedList, order: swappedListOrder },
      { ...swappedList, order: movedListOrder },
    ]);
  }

  async function moveListUp(movedIndex: number) {
    if (movedIndex <= 0) return;

    const movedList = lists[movedIndex];
    const movedListOrder = movedList.order;
    const swappedList = lists[movedIndex - 1];
    const swappedListOrder = swappedList.order;

    listActions.reorderLists(teamId, [
      { ...movedList, order: swappedListOrder },
      { ...swappedList, order: movedListOrder },
    ]);
  }

  let content: ReactNode = null;
  if (lists.length) {
    content = lists.map((list, index) => (
      <List
        key={list.listId}
        listId={list.listId}
        title={list.title}
        index={index}
        moveDown={moveListDown}
        moveUp={moveListUp}
      />
    ));
  }

  return (
    <section className={styles.lists}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Lists</h1>
        <IconButton label="New list" icon={<Plus />} onClick={createList} />
      </header>

      <ul className={styles.listOfLists} ref={listsRef}>
        {content}
      </ul>
    </section>
  );
}

const styles = css`
  @import '../variables.scss';

  .lists {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-right: 1px solid $color-border;

    @media screen and (max-width: $breakpoint) {
      display: block;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $unit;
    padding-left: $unit-2;
    border-bottom: 1px solid $color-border;
    flex: 0;
  }

  .listOfLists {
    overflow-y: auto;
    flex: 1;
    padding: 0;
    margin: 0;
  }

  .heading {
    margin: 0;
    font-size: inherit;
  }
`;
