# ArcOS

The Arcath OS for [screeps](https://screeps.com).

Written for my AI, whos journey is documented [here](https://arcath.net/category/screeps/).

**I am transitioning ArcOS into a more friendly system that can be just run. Currently it is not safe to run for yourself**

## OS

ArcOS is an Operating System. Everything is broken up into processes with a kernel to manage the run order and serialisation of the process state.

A process may not get run every tick, if you run low on CPU low priority processes will be ignored.

## CPU Usage

ArcOS will set its CPU limit at the beginning of each tick. The more CPU in your bucket the more CPU ArcOS will use. ArcOS will maintain a small reserve in the bucket to ensure that it is never killed for using too much CPU.
