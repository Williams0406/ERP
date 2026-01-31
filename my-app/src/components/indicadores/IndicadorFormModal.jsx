"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIndicador, updateIndicador } from "@/lib/api";

const MESES = [
  "ene","feb","mar","abr","may","jun",
  "jul","ago","sep","oct","nov","dic"
];

const EMPTY_FORM = {
  indicador: "",
  dueno: "",
  unidad: "",
  tipo_de_indicador: "",
  condicion: "MAYOR",
  metodo_q: "PROMEDIO",
  ano_a_la_fecha: "",
  ene_r: "", ene_o: "",
  feb_r: "", feb_o: "",
  mar_r: "", mar_o: "",
  abr_r: "", abr_o: "",
  may_r: "", may_o: "",
  jun_r: "", jun_o: "",
  jul_r: "", jul_o: "",
  ago_r: "", ago_o: "",
  sep_r: "", sep_o: "",
  oct_r: "", oct_o: "",
  nov_r: "", nov_o: "",
  dic_r: "", dic_o: "",
};

const FormField = ({ label, register, name, error, placeholder, type = "text", children, required = false }) => (
  <div className="flex flex-col mb-4">
    <label className="text-sm font-medium mb-1" htmlFor={name}>
      {label}
      {required && <span className="text-color-danger ml-1">*</span>}
    </label>

    {children ? (
      children
    ) : (
      <input
        id={name}
        type={type}
        {...register(name, {
          required: required ? "Este campo es obligatorio" : false,
        })}
        className={`input-base h-[44px] ${error ? "border-[--color-danger]" : ""}`}
        placeholder={placeholder}
      />
    )}

    {error && <span className="text-xs mt-1 text-color-danger">{error.message}</span>}
  </div>
);

export default function IndicadorFormModal({ open, setOpen, indicador }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY_FORM,
  });


  const normalizeIndicador = (indicador) => {
    const clean = { ...indicador };
    delete clean.creado_en;
    delete clean.actualizado_en;

    MESES.forEach((m) => {
      clean[`${m}_r`] = clean[`${m}_r`] ?? "";
      clean[`${m}_o`] = clean[`${m}_o`] ?? "";
    });

    clean.ano_a_la_fecha = clean.ano_a_la_fecha ?? "";

    return clean;
  };

  useEffect(() => {
    if (open) {
      if (indicador) {
        const sanitized = normalizeIndicador(indicador);
        reset({
          ...EMPTY_FORM,
          ...sanitized,
        });
      } else {
        reset(EMPTY_FORM);
      }
    }
  }, [indicador, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      indicador
        ? updateIndicador(indicador.id, data)
        : createIndicador(data),

    onSuccess: () => {
      queryClient.invalidateQueries(["indicadores"]);
      setOpen(false);
      reset({});
    },

    onError: (err) => {
      alert("Error al guardar: " + JSON.stringify(err.response?.data || err));
    },
  });

  const onSubmit = (data) => {
    MESES.forEach((m) => {
      data[`${m}_r`] = data[`${m}_r`] === "" ? null : parseFloat(data[`${m}_r`]);
      data[`${m}_o`] = data[`${m}_o`] === "" ? null : parseFloat(data[`${m}_o`]);
    });

    if (data.ano_a_la_fecha === "") data.ano_a_la_fecha = null;

    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[720px] w-full p-0 bg-white rounded-xl shadow-lg">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {indicador ? "Editar Indicador" : "Crear Nuevo Indicador"}
          </DialogTitle>
        </DialogHeader>

        {/* FORMULARIO COMPLETO */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 pb-4 max-h-[70vh] overflow-y-auto"
        >
          <h3 className="text-lg font-semibold mb-4">Información General</h3>

          <FormField
            label="Nombre del Indicador"
            name="indicador"
            register={register}
            error={errors.indicador}
            required
          />

          <FormField
            label="Dueño"
            name="dueno"
            register={register}
            error={errors.dueno}
            required
          />

          <div className="grid grid-cols-2 gap-x-6">
            <FormField label="Unidad" name="unidad" register={register} />
            <FormField
              label="Tipo de Indicador"
              name="tipo_de_indicador"
              register={register}
            />
          </div>

          <hr className="my-6" />

          <h3 className="text-lg font-semibold mb-4">Parámetros de Cálculo</h3>

          <div className="grid grid-cols-2 gap-x-6">
            <FormField label="Condición" name="condicion" required error={errors.condicion}>
              <select
                {...register("condicion", { required: "La condición es obligatoria" })}
                className="input-base h-[44px]"
              >
                <option value="MAYOR">Mayor es Mejor</option>
                <option value="MENOR">Menor es Mejor</option>
              </select>
            </FormField>

            <FormField label="Método Q" name="metodo_q" required error={errors.metodo_q}>
              <select
                {...register("metodo_q", { required: "El método es obligatorio" })}
                className="input-base h-[44px]"
              >
                <option value="PROMEDIO">Promedio</option>
                <option value="SUMA">Suma</option>
              </select>
            </FormField>
          </div>

          {/* HIDERS */}
          {MESES.map((mes) => (
            <input key={`${mes}_r`} type="hidden" {...register(`${mes}_r`)} />
          ))}
          {MESES.map((mes) => (
            <input key={`${mes}_o`} type="hidden" {...register(`${mes}_o`)} />
          ))}

          {/* FOOTER DENTRO DEL FORM */}
          <DialogFooter className="flex justify-end p-4 bg-gray-50 mt-4">
            <Button
              type="button"
              className="mr-3"
              onClick={() => setOpen(false)}
              disabled={mutation.isLoading}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading
                ? "Guardando..."
                : indicador
                ? "Guardar"
                : "Crear Indicador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
