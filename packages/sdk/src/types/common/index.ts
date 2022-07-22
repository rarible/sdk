import CallableInstance from "callable-instance"
import { Action } from "@rarible/action"

export type SimplifiedWithPrepareClassGeneral<
	S extends (...args: any) => any,
	P extends (...args: any) => any
> = S & SimplifiedWithPrepareClass<S, P>

export class SimplifiedWithPrepareClass
<SimplifiedMethod extends (...args: any) => any, PrepareMethod extends (...args: any) => any>
	extends CallableInstance<Parameters<SimplifiedMethod>, ReturnType<SimplifiedMethod>> {
  prepare: PrepareMethod
  // simplified: SimplifiedMethod
  constructor(public simplifiedMethod: SimplifiedMethod, prepareFn: PrepareMethod) {
  	super("simplified")
  	this.prepare = prepareFn
  	// this.simplified = simplifiedMethod
  }

  simplified(...args: Parameters<SimplifiedMethod>): ReturnType<SimplifiedMethod> {
  	return this.simplifiedMethod(...args)
  }
}

export class SimplifiedWithActionClass
<SimplifiedMethod extends (...args: any) => any, A extends Action<any, any, any>>
	extends CallableInstance<Parameters<SimplifiedMethod>, ReturnType<SimplifiedMethod>> {
  action: A
  // simplified: SimplifiedMethod
  constructor(public simplifiedMethod: SimplifiedMethod, actionFn: A) {
  	super("simplified")
  	this.action = actionFn
  	// this.simplified = simplifiedMethod
  }

  simplified(...args: Parameters<SimplifiedMethod>): ReturnType<SimplifiedMethod> {
  	return this.simplifiedMethod(...args)
  }
}


export type GetPrepareSimpleMethod<T extends SimplifiedWithPrepareClass<any, any>> =
  T extends SimplifiedWithPrepareClass<infer R, any> ? R : any
export type GetPrepareMethod<T extends SimplifiedWithPrepareClass<any, any>> =
  T extends SimplifiedWithPrepareClass<any, infer R> ? R : any

export class SimplifiedWrapperWithPrepareClass<
	MethodClass extends SimplifiedWithPrepareClass<any, any>,
	SimpleFn extends (...args: any) => any = GetPrepareSimpleMethod<MethodClass>,
	SimplePrepare extends (...args: any) => any = GetPrepareMethod<MethodClass>
>
	extends CallableInstance<Parameters<SimpleFn>, ReturnType<SimpleFn>> {

  prepare: SimplePrepare
  public simplifiedMethod: SimpleFn

  constructor(
  	filterSimplifiedMethod: (...args: Parameters<SimpleFn>) => ReturnType<SimpleFn>,
  	filterPrepareMethod: (...args: Parameters<SimplePrepare>) => ReturnType<SimplePrepare>
  ) {
  	super("simplified")
  	this.simplifiedMethod = <SimpleFn>((...args: Parameters<SimpleFn>): ReturnType<SimpleFn> => {
  		return filterSimplifiedMethod(...args)
  	})

  	this.prepare = <SimplePrepare>((...args: Parameters<SimplePrepare>): ReturnType<SimplePrepare> => {
  		return filterPrepareMethod(...args)
  	})
  }

  simplified(...args: Parameters<SimpleFn>): ReturnType<SimpleFn> {
  	return this.simplifiedMethod(...args)
  }
}

export type GetActionArg<T extends Action<any, any, any>> = T extends Action<any, infer R, any> ? R : any
export type GetAction<T extends SimplifiedWithActionClass<any, any>> =
  T extends SimplifiedWithActionClass<any, infer R> ? R : any
export type GetSimpleFn<T extends SimplifiedWithActionClass<any, any>> =
  T extends SimplifiedWithActionClass<infer R, any> ? R : any

export class SimplifiedWrapperWithActionClass<
	MethodClass extends SimplifiedWithActionClass<any, any>,
	SimpleFn extends (...args: any) => any = GetSimpleFn<MethodClass>,
	SimpleAction extends Action<any, any, any> = GetAction<MethodClass>
> extends CallableInstance<Parameters<SimpleFn>, ReturnType<SimpleFn>> {

  action: SimpleAction
  public simplifiedMethod: SimpleFn

  constructor(
  	filterSimplifiedMethod: (...args: Parameters<SimpleFn>) => ReturnType<SimpleFn>,
  	filterActionMethod: (request: GetActionArg<SimpleAction>) => ReturnType<SimpleAction>
  ) {
  	super("simplified")
  	this.simplifiedMethod = <SimpleFn>((...args: Parameters<SimpleFn>): ReturnType<SimpleFn> => {
  		return filterSimplifiedMethod(...args)
  	})

  	this.action = <SimpleAction>Action.create({
  		id: "send-tx",
  		run: (request: GetActionArg<SimpleAction>) => {
  			return filterActionMethod(request)
  		},
  	})
  }

  simplified(...args: Parameters<SimpleFn>): ReturnType<SimpleFn> {
  	return this.simplifiedMethod(...args)
  }
}
