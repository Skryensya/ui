# table-pager

Category: data. Stylesheet: `@skryensya/core/patterns/table-pager.css`. Signatures: `TablePager`, `TablePagerBar`, `TablePagerEnd`, `TablePagerNav`, `TablePagerSize`, `TablePagerStatus`.

## TablePager

**Use when**

- a hand-written table needs to page its rows on the client and change how many are shown
- the table (TableScroll) goes first and then a TablePagerBar with its TablePagerNav; the tbody's rows are paged

**Avoid when**

- the data comes paged from the server; the application has to control that query

Alternatives: `Table`.

- React: `import { TablePager } from "@skryensya/react/pagination"`.
- HTML: a `<div>` with `data-sk-table-pager`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `pageSize` | number | `10` |
| `page` | number | `1` |
| `siblings` | number | `1` |
| `statusTemplate` | string | `"{start}–{end} of {total}"` |
| `previousLabel` | string | `"Previous page"` |
| `nextLabel` | string | `"Next page"` |
| `pageLabel` | string | `"Page"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TableScroll`, `TablePagerBar` | yes |

**Example** (canonical tree `table-pager/page-two-of-nine`; its copy is placeholder, replace it)

```tsx
import {
  TablePager,
  TablePagerBar,
  TablePagerEnd,
  TablePagerNav,
  TablePagerSize,
  TablePagerStatus,
} from "@skryensya/react/pagination";
import { NativeSelect } from "@skryensya/react/select-native";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableScroll,
} from "@skryensya/react/table";
import { options } from "./select-options";

export function TablePagerExample() {
  return (
    <TablePager pageSize={10} page={2} siblings={1}>
      <TableScroll>
        <Table aria-label="Filas">
          <TableBody>
            <TableRow>
              <TableCell>Fila 1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 3</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 4</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 5</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 6</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 7</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 8</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 9</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 10</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 11</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 12</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 13</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 14</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 15</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 16</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 17</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 18</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 19</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 20</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 21</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 22</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 23</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 24</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 25</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 26</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 27</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 28</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 29</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 30</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 31</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 32</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 33</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 34</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 35</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 36</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 37</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 38</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 39</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 40</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 41</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 42</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 43</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 44</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 45</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 46</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 47</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 48</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 49</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 50</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 51</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 52</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 53</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 54</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 55</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 56</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 57</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 58</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 59</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 60</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 61</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 62</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 63</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 64</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 65</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 66</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 67</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 68</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 69</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 70</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 71</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 72</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 73</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 74</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 75</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 76</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 77</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 78</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 79</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 80</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 81</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 82</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 83</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 84</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 85</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 86</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 87</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 88</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 89</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fila 90</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableScroll>
      <TablePagerBar>
        <TablePagerSize>
          <NativeSelect aria-label="Filas por página" options={options} />
        </TablePagerSize>
        <TablePagerEnd>
          <TablePagerStatus>11–20 de 90</TablePagerStatus>
          <TablePagerNav />
        </TablePagerEnd>
      </TablePagerBar>
    </TablePager>
  );
}
```

`select-options.ts`:

```ts
export const options = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
];
```

```html
<div
  class="sk-table-pager"
  data-sk-table-pager
  data-page-size="10"
  data-page="2"
  data-siblings="1"
  data-status-template="{start}–{end} of {total}"
  data-previous-label="Previous page"
  data-next-label="Next page"
  data-page-label="Page"
>
  <div class="sk-table-scroll">
    <table class="sk-table" aria-label="Filas">
      <tbody class="sk-table__body">
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 1</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 2</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 3</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 4</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 5</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 6</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 7</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 8</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 9</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 10</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 11</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 12</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 13</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 14</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 15</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 16</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 17</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 18</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 19</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 20</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 21</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 22</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 23</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 24</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 25</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 26</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 27</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 28</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 29</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 30</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 31</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 32</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 33</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 34</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 35</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 36</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 37</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 38</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 39</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 40</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 41</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 42</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 43</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 44</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 45</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 46</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 47</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 48</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 49</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 50</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 51</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 52</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 53</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 54</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 55</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 56</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 57</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 58</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 59</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 60</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 61</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 62</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 63</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 64</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 65</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 66</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 67</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 68</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 69</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 70</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 71</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 72</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 73</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 74</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 75</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 76</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 77</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 78</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 79</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 80</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 81</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 82</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 83</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 84</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 85</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 86</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 87</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 88</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 89</td>
        </tr>
        <tr class="sk-table__row">
          <td class="sk-table__cell">Fila 90</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="sk-table-pager__bar">
    <div class="sk-table-pager__size">
      <select
        class="sk-select-native sk-scrollbar"
        aria-label="Filas por página"
      >
        <button type="button">
          <selectedcontent></selectedcontent>
        </button>
        <option value="10">10</option>
        <option value="25">25</option>
      </select>
    </div>
    <div class="sk-table-pager__end">
      <div
        class="sk-table-pager__status"
        data-sk-table-pager-status
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        11–20 de 90
      </div>
      <nav
        class="sk-pagination"
        data-sk-table-pager-nav
        aria-label="Pagination"
      ></nav>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/pagination.css`, `@skryensya/core/components/select.css`, `@skryensya/core/components/table.css`, `@skryensya/core/patterns/anchored.css`, `@skryensya/core/patterns/table-pager.css`.

## TablePagerBar

**Use when**

- it groups a TablePager's page size, visible range and navigation

**Avoid when**

- it is outside a TablePager

- React: `import { TablePagerBar } from "@skryensya/react/pagination"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `TablePager`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TablePagerSize`, `TablePagerEnd` | yes |

## TablePagerEnd

**Use when**

- it groups the visible range and the navigation at the end of the bar

**Avoid when**

- it is outside a TablePagerBar

- React: `import { TablePagerEnd } from "@skryensya/react/pagination"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `TablePagerBar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TablePagerStatus`, `TablePagerNav` | yes |

## TablePagerNav

**Use when**

- the enhancer has to generate a TablePager's page controls

**Avoid when**

- standalone pagination is needed; that is Pagination

Alternatives: `Pagination`.

- React: `import { TablePagerNav } from "@skryensya/react/pagination"`.
- HTML: a `<nav>`, no JavaScript needed.

- Goes inside: `TablePagerEnd`.

**Options**

| Option | Values | Default |
|---|---|---|
| `navLabel` (React: `label`) | string | `"Pagination"` |

## TablePagerSize

**Use when**

- it holds the selector that changes how many rows the TablePager shows

**Avoid when**

- there is no page-size choice

- React: `import { TablePagerSize } from "@skryensya/react/pagination"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `TablePagerBar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## TablePagerStatus

**Use when**

- it shows the range of visible rows and the total

**Avoid when**

- the text does not describe a TablePager

- React: `import { TablePagerStatus } from "@skryensya/react/pagination"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `TablePagerEnd`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:tablepagerchange` | (none: listen on the element) | { end: number, page: number, pageCount: number, pageSize: number, start: number, total: number } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-pagination-brutalist-offset`, `--sk-pagination-current-bg`, `--sk-pagination-current-border-color`, `--sk-pagination-current-fg`, `--sk-pagination-current-font-weight`, `--sk-pagination-current-highlight`, `--sk-pagination-current-ledge`, `--sk-pagination-current-shadow`, `--sk-pagination-current-wash`, `--sk-pagination-disabled-bg`, `--sk-pagination-disabled-border-color`, `--sk-pagination-disabled-fg`, `--sk-pagination-ellipsis-fg`, `--sk-pagination-gap`, `--sk-pagination-hit-size`, `--sk-pagination-item-bg`, `--sk-pagination-item-border-color`, `--sk-pagination-item-border-width`, `--sk-pagination-item-fg`, `--sk-pagination-item-font-size`, `--sk-pagination-item-font-weight`, `--sk-pagination-item-radius`, `--sk-pagination-item-shadow`, `--sk-pagination-item-size`, `--sk-pagination-item-wash`, `--sk-table-pager-bar-gap`, `--sk-table-pager-end-gap`, `--sk-table-pager-gap`, `--sk-table-pager-size-min`, `--sk-table-pager-status-fg`, `--sk-table-pager-status-font-size`, `--sk-table-pager-status-min`.
