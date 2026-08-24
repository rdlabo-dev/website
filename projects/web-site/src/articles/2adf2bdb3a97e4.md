---
title: "A Helper Method for Merging Associative Arrays in Ionic"
description: "ArrayConcatById merges timeline-style arrays by ID with overwrite, deletion, and sort options for Infinite Scroll and Refresher."
zennSlug: 2adf2bdb3a97e4
emoji: "💭"
---
```
This is the secret sauce. Let me know if you rewrite it more cleanly.

```

In Ionic, `Infinite Scroll` and `Refresher` load more content or reload it. With `Infinite Scroll` you often POST the current content ID and load only what follows; with `Refresher` you often clear existing items and reload. Depending on backend design—or when "some content was deleted, so I want to merge with what is already loaded"—you also get cases like this:

-   Like counts on a timeline may have changed, so I want to keep overwriting at least the latest 15 items  
-   Some arrays may have been deleted, so I want to overwrite and reflect deletions  
-   The update date changed, so I want to remove the old matching entry and bring in the latest

Merging associative arrays gets requirement-heavy once you think it through—"sort by ID, but for the same ID sort by created time ascending," and so on.  
This has become something of a secret sauce for me, so I am publishing the associative-array merge method I built for my needs.

```
 public ArrayConcatById<T>(
    arrayOld: T[],
    arrayNew: T[],
    key: string,
    order: string = 'DESC',
    secondaryKey: string = null,
  ): T[] {
    if (!arrayNew.length && !arrayOld.length) {
      return [];
    }
    const lead = arrayNew[0][key] as number;
    const last = arrayNew[arrayNew.length - 1][key] as number;

    arrayOld = arrayOld || [];
    arrayNew = arrayNew || [];
    arrayOld = arrayOld.filter((vol) => {
      return (
        (lead > last && ((vol[key] as number) >= lead || (vol[key] as number) <= last)) ||
        (lead < last && ((vol[key] as number) <= lead || (vol[key] as number) >= last)) ||
        (lead as number) === (last as number)
      );
    });

    let old: T[];
    if (secondaryKey !== null) {
      old = arrayOld.filter((vol) => {
        let flg = true;
        arrayNew.forEach((element) => {
          if (element[secondaryKey] === vol[secondaryKey]) {
            flg = false;
          }
        });
        return flg;
      });
    } else {
      old = arrayOld;
    }

    const oldData = old.filter((vol) => {
      let flg = true;
      arrayNew.forEach((element) => {
        if (element[key] === vol[key]) {
          flg = false;
        }
      });
      return flg;
    });
    let data = arrayNew.concat(oldData);

    // Default is descending (DESC)
    let ord = -1;

    if (order === 'ASC') {
      // Ascending (ASC) when specified
      console.log('ASC');
      ord = 1;
    }

    data = data.sort((a, b) => {
      const x = a[key] as number;
      const y = b[key] as number;
      if (x > y) {
        return ord;
      }
      if (x < y) {
        return ord * -1;
      }
      return 0;
    });

    return data;
  }

```

Use it as a helper like this. The sort ID must be numeric.

```
this.items = this.helper.ArrayConcatById<Interface>(this.items, newItems, 'id', 'ASC');

```

If `concat` does not meet your array-merge needs, give it a try. If you refactor it into something cleaner, please tell me quietly. Actually, looking at it again after a long time, I want to rewrite this...

See you again.
