def res_net(prod, usage):
    net = {res: p for res, p in prod.items()}
    for res, u in usage.items():
        if res in net:
            net[res] = net[res] - u
        else:
            net[res] = -u
    return net
