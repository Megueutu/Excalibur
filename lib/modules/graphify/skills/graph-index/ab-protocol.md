# Protocol: does the graph index pay off?

A fair comparison of the same work done with and without the index. Follow it as written, or the numbers mean nothing.

## Setup

- Choose three to five real tasks of the kind you expect to repeat. At least one must be a search across a lot of material.
- For each task, write down before starting: the starting state, and a short checklist of what a correct result contains. Pass or fail per item, decided by someone who does not know which arm produced it.
- Fix everything else: same model, same harness settings, same instructions, same starting state, a fresh session each time.

## Arms

- **A:** the work without the index.
- **B:** the work with the index available.

Run each task at least five times per arm, alternating the order. One run proves nothing: results vary from run to run.

## What to record, per run

- Context at the start of the task: `excalibur budget --json`.
- Total tokens in and out, and cost, from the harness's own usage view.
- Number of steps or tool calls.
- Elapsed time.
- Correctness: checklist items passed, out of the total.
- For work that cites sources: how many facts carry a correct origin.
- Arm B only: the cost of building the index, and how many tasks it served.

## Reading the results

- Compare medians and look at the spread, not single runs.
- Count the index's build cost against arm B, spread over the tasks it served.
- The index only wins if correctness is no worse **and** cost or steps are lower in most of the paired runs.
- Fewer than five runs per arm, or a spread that overlaps the difference: not conclusive. Say so and do not adopt it on that basis.
- Report where it did not help, not only where it did.

## Decision

Write the outcome and the numbers in the project's decision notes. Keep, drop or restrict the module to the kinds of task where it won.
