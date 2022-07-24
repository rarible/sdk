import CallableInstance from "callable-instance"
import type { Action } from "@rarible/action"

export type MethodWithPrepareGeneral<
	S extends (...args: any) => any,
	P extends (...args: any) => any
> = S & MethodWithPrepare<S, P>

export class MethodWithPrepare
<SimplifiedMethod extends (...args: any) => any, PrepareMethod extends (...args: any) => any>
	extends CallableInstance<Parameters<SimplifiedMethod>, ReturnType<SimplifiedMethod>> {
  prepare: PrepareMethod
  constructor(public simplifiedMethod: SimplifiedMethod, prepareFn: PrepareMethod) {
  	super("simplified")
  	this.prepare = prepareFn
  }

  simplified(...args: Parameters<SimplifiedMethod>): ReturnType<SimplifiedMethod> {
  	return this.simplifiedMethod(...args)
  }
}

export class MethodWithAction
<SimplifiedMethod extends (...args: any) => any, A extends Action<any, any, any>>
	extends CallableInstance<Parameters<SimplifiedMethod>, ReturnType<SimplifiedMethod>> {
  action: A
  constructor(public simplifiedMethod: SimplifiedMethod, actionFn: A) {
  	super("simplified")
  	this.action = actionFn
  }

  simplified(...args: Parameters<SimplifiedMethod>): ReturnType<SimplifiedMethod> {
  	return this.simplifiedMethod(...args)
  }
}
