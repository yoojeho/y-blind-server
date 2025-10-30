import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isNotBlank",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === "string" && value.trim().length > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}은(는) 비워둘 수 없습니다.`;
        },
      },
    });
  };
}
