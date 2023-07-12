import { createParamDecorator } from "@nestjs/common"

const User = createParamDecorator(() => {
    return {
        id: 1,
        name: 'fadia'
    }
})