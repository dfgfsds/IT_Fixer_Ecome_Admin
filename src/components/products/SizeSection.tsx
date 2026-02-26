import { useFieldArray } from "react-hook-form";
import Input from "../Input";
import Button from "../Button";
import { Plus, Trash2Icon, TrashIcon, X } from "lucide-react";

export default function SizeSection({ control, register, varietyIndex }: any) {
  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control,
    name: `varieties.${varietyIndex}.sizes`
  });
  return (
    <>
      <div className="space-y-2">

        {sizeFields?.map((size, sizeIndex) => (
          <div key={size.id} className="border-t pt-2 relative">
            <div className='flex justify-betweens'>
              <div className="flex justify-between items-center mb-4">
                <h1 className='font-bold'>Size {varietyIndex + 1}</h1>
              </div>
              <button
                type="button"
                onClick={() => removeSize(sizeIndex)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-500"
              >
                <Trash2Icon className="h-5 w-5 text-red-500" />
                {/* <X className="h-5 w-5 text-red-500" /> */}
              </button>
            </div>
            <div className='grid grid-cols-1  sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2'>
              <Input
                required
                label="Size"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size`)}
              />
              <Input
                required
                label="Size Price"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size_price`)}
              />
              <Input
                required
                label="Size MRP"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size_discount`)}
              />
              <Input
                required
                label="Size Weight"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size_weight`)}
              />
              <Input
                required
                label="Size Height"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size_height`)}
              />
              <Input
                required
                label="Size Length"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size_length`)}
              />
              <Input
                required
                label="Size Breadth"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size_breadth`)}
              />
              <Input
                required
                label="Size Sku"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size_sku`)}
              />
              <Input
                required
                label="Size Stock Quantity"
                {...register(`varieties.${varietyIndex}.sizes.${sizeIndex}.product_size_stock_quantity`)}
              />
              {/* <button type="button" className="mb-2 text-gray-400 hover:text-gray-500" onClick={() => removeSize(sizeIndex)}>  <X className="h-5 w-5" /></button> */}
            </div>
          </div>
        ))}

        <Button type="button" onClick={() => appendSize({})}>
          <Plus className="w-4 h-4" /> Add Size
        </Button>

      </div>
    </>
  )
}