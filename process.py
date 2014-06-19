import json
from operator import add
from itertools import groupby

def get_results():
    objs = []
    with open("results.txt") as f:
        for line in f:
            objs.append(json.loads(line))
    return objs

def accumulate(objs):
    return lambda accessor, fn: reduce(fn, map(accessor, objs))

def pl(lst):
    for item in lst:
        print item

def to_dict(grouped):
    return {k: list(v) for k, v in grouped}

def count_lists(dic):
    return [(k, len(v)) for k, v in dic.items()]

def counts(collection, key):
    groups = to_dict(groupby(sorted(collection, key=key), key))
    return sorted(count_lists(groups), key=K(1))

if __name__ == "__main__":
    res = get_results()
    accu = accumulate(res)

    print "Total added:\t", \
      accu(lambda o: o['addedNodes'], add)
    print "Total removed:\t",\
      accu(lambda o: o['removedNodes'], add)

    style_changes = []
    class_changes = []
    for obj in res:
        origin = obj["origin"]
        for delta in obj["deltas"]:
            if delta[0] == "@class":
                class_changes.append(delta[1:] + [origin])
            else:
                style_changes.append(delta + [origin])

    print "Total class changes:\t", len(class_changes)
    print "Total style changes:\t", len(style_changes)

    style_changes = filter(lambda s: s[3] !="https://www.youtube.com", style_changes)

    K = lambda n: lambda s: s[n]
    sorted_style = sorted(style_changes, key=K(0))
    style_groups = to_dict(groupby(sorted_style, K(0)))
    style_counts = counts(style_changes, K(0))
    for name, value in style_counts[-20:]:
        print name, "\t", value

    #pl(count_lists(to_dict(groupby(sorted(style_groups["margin"], key=K(3)), K(3)))))
