import { DataObjectProperty } from './data-object-property';
import { DataObjectTypeHandler } from './type-handler/data-object.type-handler';
import { DateTypeHandler } from './type-handler/date.type-handler';
import { EmptyConstructor } from '../empty-constructor';
import { TypeHandler } from './type-handler';

declare const Reflect: any;

export class DataObject {
    private static TypeHandlers = new Map<EmptyConstructor<Object>, TypeHandler<Object>>([
        [Date, new DateTypeHandler()]
    ]);
    private static DataObjectHandler = new DataObjectTypeHandler();

    static getTypeHandler<T>(type: EmptyConstructor<T>): TypeHandler<T> {
        const typeHandler = DataObject.TypeHandlers.get(type) as TypeHandler<T>;
        if (typeHandler) {
            return typeHandler;
        } else if (DataObject.hasProperties(type.prototype)) {
            return DataObject.DataObjectHandler as TypeHandler<T>;
        } else {
            throw new Error('DataObject: No type handler registered for object: ' + JSON.stringify(type.prototype.name));
        }
    }

    static getProperties(dataObject: Object): Array<DataObjectProperty> {
        return Reflect.getMetadata('properties', dataObject) || [];
    }

    static setProperties(dataObject: Object, properties: Array<DataObjectProperty>) {
        return Reflect.defineMetadata('properties', properties, dataObject);
    }

    static hasProperties(dataObject: Object): boolean {
        return Reflect.hasMetadata('properties', dataObject);
    }

    static clone<T extends Object>(dataObject: T): T {
        const typeHandler = DataObject.getTypeHandler(dataObject.constructor as EmptyConstructor<T>);
        return typeHandler.clone(dataObject);
    }

    static set<T extends Object>(dataObject: T, dto: T | any): T {
        const typeHandler = DataObject.getTypeHandler(dataObject.constructor as EmptyConstructor<T>);
        typeHandler.set(dataObject, dto);
        return dataObject;
    }

    static from<T extends Object>(type: EmptyConstructor<T>, dto: any): T {
        const instance = new type();
        DataObject.set(instance, dto);
        return instance;
    }

    static equals<T extends Object>(dataObject1: T, dataObject2: T): boolean {
        if (dataObject1.constructor !== dataObject2.constructor) {
            return false;
        } else {
            const typeHandler = DataObject.getTypeHandler(dataObject1.constructor as EmptyConstructor<T>);
            return typeHandler.equals(dataObject1, dataObject2);
        }
    }

    private constructor() {}
}
