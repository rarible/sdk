import CallableInstance from "callable-instance"

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
  	return this.simplifiedMethod(...(args as []))
  }
}
