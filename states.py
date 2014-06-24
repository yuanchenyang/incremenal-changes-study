import json
from operator import add
from itertools import groupby

def get_results():
    objs = []
    with open("results.txt") as f:
        for line in f:
            objs.append(json.loads(line))
    return objs

def summarize(results):
    def partial_func_nested(node):
        return {k: to_partial_func(0,v) for k,v in node.items()}

    nodes = map(lambda x: partial_func_nested(x), \
            map(lambda x: to_partial_func(1, x), \
            map(lambda x: x['deltas'], results)))

    return nodes

def to_partial_func(key, data):
    ret = dict()
    for x in data:
        if x[key] in ret:
            ret[x[key]] = ret[x[key]] + [x[:key] + x[key+1:]]
        else:
            ret[x[key]] = [x[:key] + x[key+1:]]
    return ret

def states(summary):
    #conf = function to call in case of conflicts
    def merge_dict(conf, d1, d2):
        ret = {x:y for x,y in d1.items()}
        for x in d2:
            if x in d1:
                ret[x] = conf(d1[x],d2[x])
            else:
                ret[x] = d2[x]
        return ret

    states = []
    for x in summary:
        done = False
        for y in range(len(states)):
            # If this node intersects with any previously known states
            # we need to update the old state
            if len(set(x.keys()).intersection(set(states[y].keys()))) > 0:
                states[y] = merge_dict(\
                        lambda x,y: merge_dict(\
                            lambda a,b: a+b, x, y), \
                        x, states[y])
                done = True
                break
        if not done:
            states.append(x)

    return states
