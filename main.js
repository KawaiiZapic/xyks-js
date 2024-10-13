(() => {
    const hookWith = (target, prop, hook) => {
        const originalFunction = target?.[prop];
        if (!originalFunction) throw Error("Function " + prop + " not found.");
        const proxy = new Proxy(originalFunction, {
            apply(target, thisArg, args) {
                return hook(originalFunction, thisArg, args);
            }
        });
        target[prop] = proxy;
        return originalFunction;
    }

    const st = hookWith(
        window,
        "setTimeout",
        (orig, thisArg, args) => {
            if (args[0]?.toString?.()?.includes('("canSlideToNextQuestion")')) {
                args[1] = 0;
            }
            return orig.apply(thisArg, args);
        }
    );

    const createTouch = (canvasEl, x, y) => new Touch({
        identifier: 0,
        target: canvasEl,
        clientX: x,
        clientY: y,
        force: 1
    });

    const createStartEvent = (canvasEl, x, y) => new TouchEvent("touchstart", {
        bubbles: true,
        targetTouches: [createTouch(canvasEl, x, y)],
        changedTouches: [createTouch(canvasEl, x, y)]
    });
    const createMoveEvent = (canvasEl, x, y) => new TouchEvent("touchmove", {
        bubbles: true,
        targetTouches: [createTouch(canvasEl, x, y)],
        changedTouches: [createTouch(canvasEl, x, y)],
    });
    const createEndEvent = (canvasEl, x, y) => new TouchEvent("touchend", {
        bubbles: true,
        targetTouches: [],
        changedTouches: [createTouch(canvasEl, x, y)],
    });
    const sleep = (t) => new Promise((resolve) => st(() => resolve(), t));
    const dispatchEvents = async (el, events) => {
        for (const e of events) {
            el.dispatchEvent(e);
            await sleep(0);
        }
    }
    const gt = () => {
        const canvasEl = document.querySelector("canvas.canvas");
        return dispatchEvents(canvasEl, [
            createStartEvent(canvasEl, 0, 0), 
            createMoveEvent(canvasEl, 0, 0), 
            createMoveEvent(canvasEl, 20, 10), 
            createMoveEvent(canvasEl, 0, 20), 
            createEndEvent(canvasEl, 0, 20)
        ]);
    };
    const lt = () => {
        const canvasEl = document.querySelector("canvas.canvas");
        return dispatchEvents(canvasEl, [
            createStartEvent(canvasEl, 20, 0), 
            createMoveEvent(canvasEl, 20, 0), 
            createMoveEvent(canvasEl, 0, 10), 
            createMoveEvent(canvasEl, 20, 20), 
            createEndEvent(canvasEl, 20, 20)
        ]);
    };
    
    let isClean = true;
    hookWith(JSON, "parse", (parse, thisArg, args) => {
        const result = parse.apply(thisArg, args);
        if (Array.isArray(result?.examVO?.questions)) {
            (async () => {
                const qs = result.examVO.questions;
                while (document.querySelector(".exercise-container .mask") || document.querySelector(".exercise-container .matching")) {
                    await sleep(10);
                }
                await sleep(100);
                for (const i in qs) {
                    if (qs[i].answer == "<") {
                        await lt();
                    } else if (qs[i].answer == ">") {
                        await gt();
                    }
                    isClean = false;
                    while (!isClean) await sleep(0);
                    await sleep(0);
                }
            })();
        }
        return result;
    });
    hookWith(
        CanvasRenderingContext2D.prototype, 
        "clearRect", 
        (clearRect, thisArg, args) => {
            isClean = true;
            return clearRect.apply(thisArg, args);
        }
    );    
})();
