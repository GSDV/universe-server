import formStyles from '@styles/ui/form.module.css';



export interface FormInputType {
    title: string,
    name: string,
    type: React.HTMLInputTypeAttribute
}

export interface FormType {
    action: (formData: FormData) => Promise<void>,
    inputs: FormInputType[],
    submitTitle: string
}

export default function Form({ action, inputs, submitTitle }: FormType) {
    // Non-async handleSubmit needed for loading animations to work properly in async server action functions.
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await action(formData);
    }

    return (
        <form className={formStyles.form} onSubmit={handleSubmit}>
            {inputs.map((input, i) => { 
                return (
                    <div key={i} className={formStyles.formItem}>
                        <h4>{input.title}</h4> <input type={input.type} name={input.name} />
                    </div>
                );
            })}

            <button style={{ margin: '20px', alignSelf: 'center' }} type='submit'>{submitTitle}</button>
        </form>
    );
}